# DataLegacyManager Settings Page - Approved Implementation Plan

Status: ✅ **Plan Approved by User - Ready to Proceed Step-by-Step**

## Current State
- Frontend UI: 95% complete (all tabs/sections functional, dynamic Firestore assets/nominees)
- Backend Functions: All core functions implemented (`saveUserSettings`, `updatePassword`, etc.)
- Integrations: Real-time, encryption-ready, nominee asset selection UI matches spec
- WOW Feature: Emergency countdown stubbed (needs cron trigger)

## Step-by-Step Implementation Plan

### Phase 1: UI Polish & Minor Fixes (2 steps)
- [x] **Step 1:** Edit `src/pages/Settings.jsx` - Add emergency triggered alert UI, polish lastActive display, link theme toggle to context. ✅
- [x] **Step 2:** Edit `src/context/ThemeContext.jsx` - Full Firestore sync for theme (read/write via saveUserSettings). ✅

### Phase 2: WOW Emergency Countdown (2 steps)
- [x] **Step 3:** Edit `functions/index.js` - Add `checkEmergencyTriggers` scheduled function (cron every 24h: if lastActive >30d → create accessRequest/notify). ✅
- [x] **Step 4:** Edit `functions/index.js` - Add `cancelEmergency` callable (user cancels within 24h). ✅

### Phase 3: Exports & Integration (1 step)
- [x] **Step 5:** Edit `src/services/firebase.js` - Export new functions (`checkEmergencyTriggers`, `cancelEmergency` if needed client-side). ✅

### Phase 4: Deploy & Test (User-assisted)
- [ ] **Step 6:** Local test Functions: `firebase emulators:start --only functions` → test calls from Settings.
- [ ] **Step 7:** Deploy: `firebase deploy --only functions`.
- [ ] **Step 8:** Full E2E Test: Login → Add asset/nominee → Settings features → Simulate inactivity → Verify emergency trigger.
- [ ] **Step 9:** Complete task with `attempt_completion`.

## Progress Tracking
- **Completed:** Steps 1-5 ✅ (UI/Theme/WOW backend fully implemented)
- **Ready for Phase 4:** Deploy & Test (run commands below)

**Instructions:** Mark [x] as each step completes. Update file after each major step. Use `edit_file` tools precisely.


