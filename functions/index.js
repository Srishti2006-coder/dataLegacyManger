const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

admin.initializeApp();
const db = admin.firestore();

// 🔐 SECRET
const JWT_SECRET =
  functions.config().app?.secret ||
  process.env.JWT_SECRET ||
  "default-super-secret-key-change-me";

// 🌍 FRONTEND URL
const FRONTEND_URL = "http://127.0.0.1:3000";

// 📩 EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "srishtibansal505@gmail.com",
    pass: "duovpbvitkpxvoyf"
  }
});


// ================================
// 1. SEND NOMINEE EMAIL (CLEAN VERSION)
// ================================
exports.sendNomineeVerificationEmail = functions.https.onCall(
  async (data, context) => {

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

    const nomineeDoc = await db.collection("nominees").doc(nomineeId).get();

    if (!nomineeDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Nominee not found");
    }

    const nominee = nomineeDoc.data();

    if (!nominee.email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Email not found"
      );
    }

    // 🔐 TOKEN CREATE
    const token = jwt.sign(
      { nomineeId, email: nominee.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔗 VERIFY LINK
    const verificationUrl = `${FRONTEND_URL}/nominee-verify?token=${token}`;

    // 📧 SEND EMAIL
    await transporter.sendMail({
      from: "Legacy AI <srishtibansal505@gmail.com>",
      to: nominee.email,
      subject: "Verify Nominee",
      html: `
        <h2>Hello ${nominee.name}</h2>
        <p>You have been added as a nominee.</p>

        <a href="${verificationUrl}"
           style="display:inline-block;
                  padding:10px 20px;
                  background:#4f46e5;
                  color:white;
                  text-decoration:none;
                  border-radius:5px;">
          Verify Now
        </a>
      `
    });

    await db.collection("nominees").doc(nomineeId).update({
      verificationSent: true,
      verificationSentAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  }
);


// ================================
// 2. VERIFY TOKEN
// ================================
exports.verifyNomineeToken = functions.https.onCall(
  async (data, context) => {

    const { token } = data;

    if (!token) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Token required"
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { nomineeId, email } = decoded;

      await db.collection("nominees").doc(nomineeId).update({
        verified: true,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        verifiedBy: email
      });

      return {
        success: true,
        message: "Nominee verified successfully"
      };

    } catch (err) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid or expired token"
      );
    }
  }
);