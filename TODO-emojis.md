# Remove All Emojis from DataLegacyManager

**Approved Plan**: Remove only emoji characters from all text content, buttons, icons, SVG text, object values. Preserve all functionality, styles, layout. Empty divs where icons were.

**Files to Edit** (prioritized):
1. src/pages/Nominee.jsx ✓
2. src/pages/ViewAssets.jsx ✓
3. src/pages/Vault.jsx ✓
4. src/pages/Landing.jsx ✓
5. src/pages/EmergencyAccess.jsx ✓
6. src/pages/NomineeVerify.jsx ✓
7. src/components/LoginForm.jsx ✓
8. src/components/TagInput.jsx ✓
9. src/components/AIAssistant.jsx ✓
10. src/components/AnimatedSVGHero.jsx 
11. src/components/FeatureCard.jsx 
12. src/pages/NewViewAssets.jsx 
13. src/components/DashboardCard.jsx 
14. Other pages if any 

**Instructions for each**:
- Button text: remove leading emoji
- Labels: remove emoji prefix
- Status: replace ✓/✗ with empty or simple text ''
- Icon divs: <div class="feature-icon">emoji</div> → <div class="feature-icon"></div>
- SVG text: replace with text or empty
- Object values: "emoji" → ""

**Testing**:
- Run `npm start`
- Check Landing, Vault, ViewAssets (nominees), Nominee, Login, EmergencyAccess etc.

**Completion**:
- All ✓
- attempt_completion with result


