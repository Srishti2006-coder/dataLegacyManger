
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

admin.initializeApp();
const db = admin.firestore();

// 🔐 JWT secret
const JWT_SECRET =
  functions.config().app.secret ||
  process.env.JWT_SECRET ||
  "default-super-secret-key-change-me";

// 📩 Gmail transporter (Nodemailer)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "srishtibansal505@gmail.com",        // 👈 change this
    pass: "duovpbvitkpxvoyf"            // 👈 Gmail App Password
  }
});


// ================================
// 1. SEND NOMINEE VERIFICATION EMAIL
// ================================
exports.sendNomineeVerificationEmail = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated."
      );
    }

    const { nomineeId } = data;
    if (!nomineeId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "nomineeId required."
      );
    }

    try {
      // Fetch nominee
      const nomineeDoc = await db.collection("nominees").doc(nomineeId).get();

      if (!nomineeDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Nominee not found."
        );
      }

      const nominee = nomineeDoc.data();

      if (!nominee.email) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Nominee email required."
        );
      }

      // 🔐 Create JWT token
      const token = jwt.sign(
        { nomineeId, email: nominee.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const origin =
        functions.config().app.origin || "http://localhost:3000";

      const verificationUrl = `${origin}/nominee-verify?token=${token}`;

      // ✉️ SEND EMAIL (Nodemailer)
      await transporter.sendMail({
        from: `Legacy AI <YOUR_EMAIL@gmail.com>`,
        to: nominee.email,
        subject: "You are selected as Nominee - Verification Required",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2>Congratulations 🎉</h2>
            <p>Hello <b>${nominee.name}</b>,</p>
            <p>You have been selected as a nominee for digital assets.</p>

            <p>Please verify your status by clicking below:</p>

            <a href="${verificationUrl}" 
               style="display:inline-block;
                      padding:12px 20px;
                      background:#4f46e5;
                      color:#fff;
                      text-decoration:none;
                      border-radius:8px;">
              Verify Now
            </a>

            <p style="margin-top:20px;">
              This link will expire in 7 days.
            </p>

            <hr />
            <small>DataLegacyManager - Secure Digital Legacy System</small>
          </div>
        `
      });

      // Update Firestore flag
      await db.collection("nominees").doc(nomineeId).update({
        verificationSent: true,
        verificationSentAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        message: "Verification email sent successfully!"
      };
    } catch (error) {
      console.error("Send verification error:", error);
      throw new functions.https.HttpsError(
        "internal",
        error.message
      );
    }
  }
);


// ================================
// 2. VERIFY NOMINEE TOKEN
// ================================
exports.verifyNomineeToken = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must sign in with Google."
      );
    }

    const { token } = data;
    if (!token) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Token required."
      );
    }

    try {
      // Verify JWT
      const decoded = jwt.verify(token, JWT_SECRET);
      const { nomineeId, email: storedEmail } = decoded;

      const userEmail = context.auth.token.email;

      // Security check
      if (userEmail !== storedEmail) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Email mismatch."
        );
      }

      // Mark verified
      await db.collection("nominees").doc(nomineeId).update({
        verified: true,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        verifiedBy: userEmail
      });

      return {
        success: true,
        message: "Nominee verified successfully!",
        nomineeId
      };
    } catch (error) {
      console.error("Verify token error:", error);

      if (
        error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError"
      ) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid or expired token."
        );
      }

      throw new functions.https.HttpsError(
        "internal",
        "Verification failed."
      );
    }
  }
);