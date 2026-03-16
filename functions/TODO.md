
# Data Legacy Manager - Task Progress Tracker

## Firebase Functions Setup (Approved Plan)
### Steps:
- [x] Copy functions/.env.example to functions/.env and fill with real values
- [x] Install Firebase CLI: `npm install -g firebase-tools` (already v15.10.0)
- [ ] Login: `firebase login` (run this next - opens browser)
- [ ] Set config: `firebase functions:config:set sendgrid.key="SG.yourkey" sendgrid.secret="yourjwtsecret" app.origin="http://localhost:3000"`
- [x] Local test: `firebase emulators:start --only functions` (running on demo project, login improves)
- [ ] Verify config: `firebase functions:config:get`
- [ ] Deploy: `firebase deploy --only functions`
- [ ] Test in app: Add nominee → check email sent

## How It Works
1. App calls Firebase Function `sendNomineeVerificationEmail`
2. Function uses SendGrid key from config/process.env to send email with JWT token
3. Nominee clicks link, calls `verifyNomineeToken` which verifies JWT
4. No changes to React code needed - works out of box once configured.

## Next Features
(Add more as needed)
