# Data Legacy Manager - AI Nominee Access Implementation TODO

## Approved Plan Steps (User confirmed: OK)

### Phase 1: Core Fixes & AI Scanner (Priority 1)
- [ ] ✅ **Step 1**: Create TODO.md (current)
- [x] **Step 2**: Install crypto-js && Fix AddAsset.jsx (formatting, AI scanner, base64 encrypt prep) ✓
- [x] **Step 3**: Create src/services/encryption.js (CryptoJS AES utils) + Integrate into AddAsset.jsx ✓

**Progress**: 7/12 complete

### Phase 2: Nominee Verification & Emergency Flow ✓ COMPLETE

### Phase 3: Vault & Access Control
- [x] **Step 7**: Implement Vault.jsx (user full view w/ decryption, nominee-ready) ✓

### Phase 4: Firebase Backend & Testing
- [ ] **Step 9**: Firebase Functions setup (production OTP/email - optional for demo)
- [ ] **Step 10**: Update Firestore rules
- [ ] **Step 11**: Full e2e test
- [ ] **Step 12**: Deploy
- [ ] **Step 8**: Update src/App.js (add new routes: /nominee-verify, /emergency-access)

### Phase 4: Firebase Backend
- [ ] **Step 9**: Firebase Functions setup (nomineeVerify, sendOTP, verifyOTP)
- [ ] **Step 10**: Update firebase.js, Firestore rules (encrypted fields, tempAccess)
- [ ] **Step 11**: Test end-to-end: Add asset (scan/encrypt) → nominee add/verify → emergency OTP → vault access
- [ ] **Step 12**: Deploy functions, complete!

**Next Step**: Step 2 - Install deps & update AddAsset.jsx. Confirm before editing files.

**Progress**: 1/12 complete
