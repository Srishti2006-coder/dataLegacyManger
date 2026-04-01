
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

admin.initializeApp();
const db = admin.firestore();

// 🔐 JWT secret
const JWT_SECRET =
  functions.config().app?.secret ||
  process.env.JWT_SECRET ||
  "default-super-secret-key-change-me";

// 🌍 FRONTEND URL (CHANGE ONLY THIS WHEN DEPLOYING)
const FRONTEND_URL = "http://127.0.0.1:3000"; 
// 👉 deploy ke baad: https://your-app.vercel.app

// 📩 Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "srishtibansal505@gmail.com",
    pass: "duovpbvitkpxvoyf"
  }
});


// ================================
// 1. SEND NOMINEE VERIFICATION EMAIL
// ================================
exports.sendNomineeVerificationEmail = functions.https.onCall(
  async (data, context) => {

    console.log("🔥 FUNCTION STARTED:", data);

    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Login required"
      );
    }

    const { nomineeId } = data;

    if (!nomineeId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "nomineeId required"
      );
    }

    try {
      // 📄 Get nominee
      const nomineeDoc = await db.collection("nominees").doc(nomineeId).get();

      if (!nomineeDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Nominee not found");
      }

      const nominee = nomineeDoc.data();

      if (!nominee.email) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Email required"
        );
      }

      // 🔐 Create token
      const token = jwt.sign(
        { nomineeId, email: nominee.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const verificationUrl = `${FRONTEND_URL}/nominee-verify?token=${token}`;

      console.log("📧 Sending email to:", nominee.email);
      console.log("🔗 URL:", verificationUrl);

      // 📩 Send email
      await transporter.sendMail({
        from: `Legacy AI <srishtibansal505@gmail.com>`,
        to: nominee.email,
        subject: "Verify Nominee",
        html: `
          <h2>Hello ${nominee.name}</h2>
          <p>You are added as nominee.</p>

          <a href="${verificationUrl}" 
             style="padding:10px 20px;
                    background:#4f46e5;
                    color:white;
                    text-decoration:none;
                    border-radius:5px;">
             Verify Now
          </a>

          <p>Valid for 7 days</p>
        `
      });

      console.log("✅ EMAIL SENT");

      // 🔄 Update Firestore
      await db.collection("nominees").doc(nomineeId).update({
        verificationSent: true,
        verificationSentAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };

    } catch (err) {
      console.error("❌ ERROR:", err);
      throw new functions.https.HttpsError("internal", err.message);
    }
  }
);


// ================================
// 2. VERIFY NOMINEE TOKEN
// ================================
exports.verifyNomineeToken = functions.https.onCall(
  async (data, context) => {

    console.log("🔍 VERIFY FUNCTION STARTED");

    const { token } = data;

    if (!token) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Token required"
      );
    }

    try {
      // 🔐 Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      const { nomineeId, email } = decoded;

      console.log("✅ TOKEN VERIFIED:", nomineeId);

      // 🔄 Update Firestore
      await db.collection("nominees").doc(nomineeId).update({
        verified: true,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        verifiedBy: email
      });

      return {
        success: true,
        message: "Verified successfully"
      };

    } catch (error) {
      console.error("❌ VERIFY ERROR:", error);

      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid or expired token"
      );
    }
  }
);

exports.sendNomineeEmail = functions.firestore
  .document("nominees/{id}")
  .onCreate(async (snap, context) => {

    console.log("🔥 FIRESTORE TRIGGER FIRED");

    const nominee = snap.data();

    if (!nominee.email) {
      console.log("❌ No email found");
      return;
    }

    try {
      console.log("📧 Sending email to:", nominee.email);

      await transporter.sendMail({
        from: "Legacy AI <srishtibansal505@gmail.com>",
        to: nominee.email,
        subject: "You are added as Nominee",
        html: `
          <h2>Hello ${nominee.name}</h2>
          <p>You have been added as a nominee.</p>
        `
      });

      console.log("✅ EMAIL SENT");

      await db.collection("nominees").doc(context.params.id).update({
        emailSent: true,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp()
      });

    } catch (err) {
      console.error("❌ EMAIL ERROR:", err);
    }
  });