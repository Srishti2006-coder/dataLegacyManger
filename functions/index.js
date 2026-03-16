const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");

admin.initializeApp();
const db = admin.firestore();

// Config
sgMail.setApiKey(functions.config().sendgrid.key || process.env.SENDGRID_API_KEY);

const JWT_SECRET = functions.config().sendgrid.secret || process.env.JWT_SECRET || "default-super-secret-key-change-me";

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
