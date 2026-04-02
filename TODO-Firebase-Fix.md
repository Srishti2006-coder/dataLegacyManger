# Firebase Real-time + Production Fix
Status: 🚀 IN PROGRESS

## Plan Steps:
- [x] 1. Create this TODO.md ✅
- [✅] 2. Edit src/services/firebase.js (emulator condition + safety + logs)
- [✅] 3. Edit src/pages/ViewAssets.jsx (onSnapshot real-time listener)
- [ ] 4. Test local dev (npm start → should use LIVE Firebase)
- [ ] 5. Test emulator (firebase emulators:start → should use LOCAL)
- [ ] 6. Verify prod writes in Firebase Console
- [ ] 7. Complete: attempt_completion

**Key Goals:**
- Production/Live: 🔴 LIVE FIRESTORE (no emulator)
- Local dev: 🟢 EMULATOR only on localhost/127.0.0.1
- ViewAssets: Real-time updates with onSnapshot()

