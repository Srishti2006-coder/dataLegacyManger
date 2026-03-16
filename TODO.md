# Fix Send Verification Button Issue

## Status: CLI Setup ✅ | Emulator Testing Next

### Completed:
- [x] Firebase login
- [x] Project selected (`firebase use [project-id]`)
- [x] /nominee page accessible

### 1. Install Functions Dependencies
- [ ] cd functions &amp;&amp; npm install firebase-functions firebase-admin @sendgrid/mail jsonwebtoken

### 2. Start Emulators ✅ (executed)
```
firebase emulators:start --only functions,firestore,ui,auth
```
Emulator Functions: http://localhost:5001
- App runs on http://localhost:3000
- Functions on http://localhost:5001
- Test: Add nominee w/ email → click Send Verification → check functions logs (emulator console)

### 3. Mock SendGrid ✅ 
functions/index.js updated with emulator logging (logs URL to copy/paste)

### 4. Test Full Flow
- [ ] Add nominee w/ email in /nominee
- [ ] Click Send Verification → check emulator logs
- [ ] Manually get generated verificationUrl from logs
- [ ] Visit /nominee-verify?token=... → login different Google acct → see ✅

### 5. Production Deploy (after emulator works)
- [ ] firebase functions:config:set sendgrid.key="SG.xxx"
- [ ] firebase deploy --only functions

### 6. Verify
- [ ] Test real email
- [ ] functions:log

**Current Progress: 30%** (CLI ready, emulator next)

