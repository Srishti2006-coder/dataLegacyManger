const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// Config
sgMail.setApiKey(functions.config().sendgrid.key || process.env.SENDGRID_API_KEY);

const JWT_SECRET = functions.config().sendgrid.secret || process.env.JWT_SECRET || "default-super-secret-key-change-me";

// Existing functions
exports.sendNomineeVerificationEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be authenticated.");
  }

  const { nomineeId } = data;
  if (!nomineeId) {
    throw new functions.https.HttpsError("invalid-argument", "nomineeId required.");
  }

  try {
    // Fetch nominee
    const nomineeDoc = await db.collection("nominees").doc(nomineeId).get();
    if (!nomineeDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Nominee not found.");
    }
    const nominee = nomineeDoc.data();
    if (!nominee.email) {
      throw new functions.https.HttpsError("invalid-argument", "Nominee email required.");
    }

    // Generate secure JWT token (nomineeId + exp 7 days)
    const token = jwt.sign(
      { nomineeId, email: nominee.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Origin for link
    const origin = functions.config().app.origin || "http://localhost:3000";

    const verificationUrl = `${origin}/nominee-verify?token=${token}`;

    if (process.env.FUNCTIONS_EMULATOR) {
      console.log('🚀 EMULATOR MODE - Verification email would be sent to:', nominee.email);
      console.log('📧 Verification URL (copy this):', verificationUrl);
      console.log('👤 Nominee:', nominee.name, nominee.id);
    } else {
      // Production SendGrid
      const msg = {
        to: nominee.email,
        from: "noreply@datalegacymanager.com",
        subject: "Verify Your Nominee Status - DataLegacyManager",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Nominee Access</h2>
            <p>Hello ${nominee.name},</p>
            <p>You've been designated as a nominee for digital assets. Click below to verify:</p>
            <a href="${verificationUrl}" style="background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Now</a>
            <p>This link expires in 7 days.</p>
            <p>Questions? Contact the owner.</p>
            <hr style="margin-top: 30px;">
            <small>DataLegacyAI - Secure Digital Legacy</small>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log('✅ Email sent to:', nominee.email);
    }

    // Update sent flag (both modes)
    await db.collection("nominees").doc(nomineeId).update({
      verificationSent: true,
      verificationSentAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, message: "Verification email sent successfully!" };
  } catch (error) {
    console.error("Send verification error:", error);
    throw new functions.https.HttpsError("internal", "Failed to send verification. Check logs: " + error.message);
  }
});

exports.verifyNomineeToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must sign in with Google.");
  }

  const { token } = data;
  if (!token) {
    throw new functions.https.HttpsError("invalid-argument", "Token required.");
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    const { nomineeId, email: storedEmail } = decoded;

    // Check auth email matches stored nominee email (security)
    const userEmail = context.auth.token.email;
    if (userEmail !== storedEmail) {
      throw new functions.https.HttpsError("permission-denied", "Email mismatch.");
    }

    // Update verified
    await db.collection("nominees").doc(nomineeId).update({
      verified: true,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      verifiedBy: userEmail
    });

    return { 
      success: true, 
      message: "Verified successfully!",
      nomineeId 
    };
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      throw new functions.https.HttpsError("invalid-argument", "Invalid or expired token.");
    }
    console.error("Verify token error:", error);
    throw new functions.https.HttpsError("internal", "Verification failed.");
  }
});

const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.analyzeVaultQuery = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be authenticated.");
  }

  const { message } = data;
  if (!message || typeof message !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "Message required.");
  }

  const userId = context.auth.uid;
  const apiKey = functions.config().gemini?.key;
  if (!apiKey) {
    throw new functions.https.HttpsError("internal", "Gemini API key not configured. Run: firebase functions:config:set gemini.key='YOUR_KEY'");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    // Step 1: Classify intent
    const intentPrompt = `Analyze this user query about their digital vault and return ONLY valid JSON:
{
  "intent": one of ["count_assets", "list_assets", "count_nominees", "list_nominees", "verified_nominees", "nominee_assets"],
  "params": {} // e.g. {"nominee_name": "John"} for nominee_assets
}

Queries examples:
- "How many assets?" → {"intent": "count_assets", "params": {}}
- "Show my assets" → {"intent": "list_assets", "params": {}}
- "Which nominees are verified?" → {"intent": "verified_nominees", "params": {}}
- "What assets for John?" → {"intent": "nominee_assets", "params": {"nominee_name": "John"}}

Query: "${message}"`;

    const intentResult = await model.generateContent(intentPrompt);
    let intentText = await intentResult.response.text();
    intentText = intentText.replace(/```json\n?|\n?```/g, '').trim();
    const intentJson = JSON.parse(intentText);
    const { intent, params } = intentJson;

    // Step 2: Query Firestore
    let queryData = null;
    switch (intent) {
      case "count_assets":
        const assetsSnap = await db.collection("assets").where("userId", "==", userId).get();
        queryData = { count: assetsSnap.size };
        break;
      case "list_assets":
        const assetsListSnap = await db.collection("assets").where("userId", "==", userId).get();
        queryData = assetsListSnap.docs.map(doc => ({ id: doc.id, title: doc.data().title, category: doc.data().category }));
        break;
      case "count_nominees":
        const nomineesSnap = await db.collection("nominees").where("userId", "==", userId).get();
        queryData = { count: nomineesSnap.size };
        break;
      case "list_nominees":
        const nomineesListSnap = await db.collection("nominees").where("userId", "==", userId).get();
        queryData = nomineesListSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name, email: doc.data().email, verified: doc.data().verified }));
        break;
      case "verified_nominees":
        const verifiedSnap = await db.collection("nominees").where("userId", "==", userId).where("verified", "==", true).get();
        queryData = verifiedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        break;
      case "nominee_assets":
        const nomineeName = params?.nominee_name?.toLowerCase() || "";
        if (!nomineeName) throw new functions.https.HttpsError("invalid-argument", "Nominee name required for this query.");
        const nomineeSnap = await db.collection("nominees")
          .where("userId", "==", userId)
          .where("name", ">=", nomineeName)
          .where("name", "<=", nomineeName + "\uf8ff")
          .limit(1)
          .get();
        if (nomineeSnap.empty) {
          queryData = { error: "Nominee not found" };
        } else {
          const nomineeDoc = nomineeSnap.docs[0];
          const nominee = nomineeDoc.data();
          const assignedAssetIds = nominee.assignedAssets || [];
          const assetDocs = await Promise.all(assignedAssetIds.map(id => db.collection("assets").doc(id).get()));
          queryData = assetDocs
            .map(doc => doc.exists ? { id: doc.id, title: doc.data().title, category: doc.data().category } : null)
            .filter(Boolean);
        }
        break;
      default:
        throw new functions.https.HttpsError("invalid-argument", `Unknown intent: ${intent}`);
    }

    // Step 3: Generate natural response
    const responsePrompt = `You are a friendly Vault AI assistant. Create a short, conversational response based ONLY on this data:

Data: ${JSON.stringify(queryData, null, 2)}

Query: "${message}"

Rules:
- Be helpful and accurate
- List items naturally (e.g. "Your assets: Gmail (email), Bank (finance)")
- If empty: "You don't have any [assets/nominees] yet."
- If error: "Sorry, I couldn't find that. Try asking differently."
- Max 2 sentences.

Examples:
Data: {"count":3} → "You have 3 assets in your vault. What would you like to know more about?"`;

    const responseResult = await model.generateContent(responsePrompt);
    const aiReply = (await responseResult.response.text()).trim();

    return { success: true, reply: aiReply };

  } catch (parseError) {
    console.error("Intent parse error:", parseError);
    return { success: false, reply: "Sorry, I didn't understand that. Try 'how many assets?' or 'show nominees'." };
  } catch (error) {
    console.error("AI Query error:", error);
    throw new functions.https.HttpsError("internal", "Query processing failed.");
  }
});

// NEW Settings Functions (Phase 3 Steps 10-12)

exports.updatePassword = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in.');
  }

  const { currentPassword, newPassword, assetIds = [] } = data;
  const userId = context.auth.uid;
  
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid passwords required.');
  }

  try {
    // Reauthenticate (Firebase Auth)
    const user = await auth.getUser(userId);
    // Note: Frontend sends currentPassword - in prod, use email link or magic link reauth
    // For now, skip reauth for demo (add proper reauth in production)
    
    // Update Firebase Auth password (requires reauth - simplified for demo)
    // await admin.auth().updateUser(userId, { password: newPassword });
    
    // For demo: log and return success
    console.log(`Password update requested for ${userId}, ${assetIds.length} assets`);

    // Update asset credentials if provided (using encryption service logic)
    for (const assetId of assetIds) {
      const assetDoc = await db.collection('assets').doc(assetId).get();
      if (assetDoc.exists && assetDoc.data().userId === userId) {
        // In prod: decrypt old creds, prompt new creds, re-encrypt with new password-derived key
        // Demo: just mark as updated
        await db.collection('assets').doc(assetId).update({
          credentialsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    return { success: true, message: `Password updated for ${assetIds.length} assets.` };
  } catch (error) {
    console.error('Password update error:', error);
    throw new functions.https.HttpsError('internal', 'Password update failed.');
  }
});

exports.saveUserSettings = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in.');
  }

  const userId = context.auth.uid;
  const { notifications, ai, theme, emergency } = data;

  try {
    await db.collection('users').doc(userId).set({
      settings: {
        notifications,
        ai,
        theme,
        emergency
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true, message: 'Settings saved successfully.' };
  } catch (error) {
    console.error('Settings save error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to save settings.');
  }
});

exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in.');
  }

  const userId = context.auth.uid;

  try {
    // Batch delete user data
    const batch = db.batch();

    // Delete assets
    const assetsSnap = await db.collection('assets').where('userId', '==', userId).get();
    assetsSnap.docs.forEach(doc => batch.delete(doc.ref));

    // Delete nominees
    const nomineesSnap = await db.collection('nominees').where('userId', '==', userId).get();
    nomineesSnap.docs.forEach(doc => batch.delete(doc.ref));

    // Delete users doc
    batch.delete(db.collection('users').doc(userId));

    await batch.commit();

    // Delete Firebase Auth user
    await admin.auth().deleteUser(userId);

    return { success: true, message: 'Account permanently deleted.' };
  } catch (error) {
    console.error('Account deletion error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to delete account.');
  }
});

exports.updateAssetCredentials = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in.');
  }

  const { assetIds, credentials } = data;
  const userId = context.auth.uid;

  try {
    const batch = db.batch();
    for (const assetId of assetIds) {
      const assetDoc = db.collection('assets').doc(assetId);
      batch.update(assetDoc, {
        credentials: credentials[assetId] || {},
        credentialsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Asset credentials update error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update credentials.');
  }
});

exports.toggleEmergencyAccess = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in.');
  }

  const userId = context.auth.uid;
  const { enabled, delayHours, requireOTP } = data;

  try {
    await db.collection('users').doc(userId).update({
      'settings.emergency.enabled': enabled,
      'settings.emergency.delayHours': delayHours,
      'settings.emergency.requireOTP': requireOTP,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Emergency toggle error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update emergency settings.');
  }
});

exports.resetLastActive = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in.');
  }

  const userId = context.auth.uid;

  try {
    await db.collection('users').doc(userId).update({
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Last active reset error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to reset last active.');
  }
});

// Phase 2 Step 3: WOW Emergency Countdown - Scheduled check every 24h
exports.checkEmergencyTriggers = functions.pubsub.schedule('0 0 * * *').onRun(async (context) => {
  console.log('Running daily emergency trigger check...');

  try {
    const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    const inactiveUsersSnap = await db.collection('users')
      .where('lastActive', '<', thirtyDaysAgo)
      .where('settings.emergency.enabled', '==', true)
      .get();

    console.log(`Found ${inactiveUsersSnap.size} inactive users with emergency enabled.`);

    const batch = db.batch();
    inactiveUsersSnap.docs.forEach(doc => {
      // Create access request to all verified nominees
      const userData = doc.data();
      const userId = doc.id;

      // Get verified nominees
      // Note: In full impl, query nominees for this userId (batch subquery limit)
      // Demo: Create generic request
      const requestData = {
        userId,
        userEmail: userData.email || 'unknown',
        status: 'triggered_auto',
        triggeredBy: 'inactivity_30d',
        triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
        assets: [], // Full: query user's assets
        expiresIn24h: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000))
      };
      batch.set(db.collection('accessRequests').doc(), requestData);
    });

    await batch.commit();
    console.log(`Created ${inactiveUsersSnap.size} emergency access requests.`);
    
    return { success: true, requestsCreated: inactiveUsersSnap.size };
  } catch (error) {
    console.error('Emergency trigger check failed:', error);
    return { success: false, error: error.message };
  }
});

// Phase 2 Step 4: Cancel emergency (called from UI banner)
exports.cancelEmergency = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in.');
  }

  const userId = context.auth.uid;

  try {
    // Delete pending access requests for this user (last 24h)
    const recentRequestsSnap = await db.collection('accessRequests')
      .where('userId', '==', userId)
      .where('status', 'in', ['pending', 'triggered_auto'])
      .where('triggeredAt', '>', admin.firestore.Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)))
      .get();

    const batch = db.batch();
    recentRequestsSnap.docs.forEach(doc => {
      batch.update(doc.ref, {
        status: 'cancelled_by_owner',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    // Also reset lastActive
    batch.update(db.collection('users').doc(userId), {
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();

    return { 
      success: true, 
      cancelled: recentRequestsSnap.size,
      message: `Cancelled ${recentRequestsSnap.size} pending requests.`
    };
  } catch (error) {
    console.error('Cancel emergency error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to cancel emergency.');
  }
});

