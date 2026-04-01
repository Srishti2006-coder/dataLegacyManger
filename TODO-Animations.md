# Page Fade-In Animation Implementation
✅ 1. Add global `.page-animate` CSS + `@keyframes pageFadeIn` to `src/index.css`  
✅ 2. Update protected pages `{page}-main` class += `page-animate`:
   - ✅ Dashboard.jsx  
   - ✅ Profile.jsx  
   - ✅ ViewAssets.jsx  
   - ✅ AddAsset.jsx  
   - ✅ Nominee.jsx  
   - ✅ Settings.jsx  
   - ✅ Vault.jsx  
   - [ ] Will.jsx  
   - ✅ EmergencyAccess.jsx  
   - [ ] NomineeVerify.jsx  
✅ 3. Update public pages:
   - ✅ Landing.jsx (root `.landing-container`)  
   - ✅ Login.jsx (`.auth-card`)  
   - ✅ Signup.jsx (`.auth-card`)  
✅ [ ] 4. Test navigation: Dashboard → Profile → ViewAssets → Login (smooth 300ms fade-in + up)  
✅ [ ] 5. Performance check (devtools: no jank, <16ms frames)  
✅ [ ] 6. Mark complete & attempt_completion
