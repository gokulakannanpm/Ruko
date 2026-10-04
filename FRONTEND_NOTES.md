# FRONTEND_NOTES.md - Ruko MVP

## 1. How to run

### Prerequisites
Node.js (v18+) and npm.

### Installation
```bash
npm install
```

### Local Development Server
```bash
npm run dev
```
Open http://localhost:5173 in your browser.

### Run Unit Tests
```bash
npm test
```
Runs all Vitest unit tests in `tests/`.

### Production Build & PWA Generation
```bash
npm run build
```
Generates production assets in `dist/` with PWA service worker precaching static shell assets.

---

## 2. Architecture & What is Mocked

- **UI Stack**: React 19 + TypeScript + Vite + Tailwind CSS v4.
- **Design Tokens**: Custom HSL/hex design system mapping `--paper`, `--surface`, `--sunken`, `--ink`, `--ink-muted`, `--green`, `--amber-*`, `--red-*`.
- **Typography**: `@fontsource-variable/source-sans-3`, `@fontsource-variable/source-serif-4`, lazy-loaded `@fontsource/noto-sans-tamil`.
- **Routing**: Zero-dependency Hash Router (`#/` for home/result, `#/privacy` for privacy terms).
- **Client Masking**: `lib/mask.ts` hides OTPs, card numbers, Aadhaar, PAN, phone numbers, and bank account numbers on device before sending. Sentinels protect URLs, `@-handles`, and SEBI registration IDs.
- **Mock Integration**: `src/api/useAnalyze.ts` and `src/api/useHealth.ts` provide realistic simulated responses:
  - Default / Tanglish investment pitch -> `sampleTanglishResponse` (3 claims, `several_indicators`).
  - Mutual fund disclaimer -> `sampleNoneFoundResponse` (`none_found`, no risk indicators).
  - Stock advice question -> `sampleAdviceRequestResponse` (`advice_request`, refusal panel).
  - Tamil script pitch -> `sampleTamilPitchResponse` (`several_indicators`, Tamil script quote).

---

## 3. Acceptance Criteria Status

| Criteria | Status | Details |
|---|---|---|
| 1. Input screen with H1, panel & 3-step "what happens" | **PASS** | Simple input screen, no hero section or decorative art |
| 2. Tanglish sample & full result flow | **PASS** | Skeletons match layout, 3 claims with definition lists |
| 3. ClaimRow 5 visible parts | **PASS** | Quote, Indicator, Why it matters, Verify through, Limit |
| 4. Bidirectional mark & ledger jumping | **PASS** | Keyboard accessible `.focus()` & `scrollIntoView` |
| 5. English & Tamil instant toggle | **PASS** | Bilingual API text, line-height 1.75 on Tamil script |
| 6. Hard Product Copy Rules | **PASS** | Zero use of "safe", "scam" as fact, or numeric fraud scores |
| 7. Client-side masking & test vectors | **PASS** | Masking algorithm passes 8 unit tests |
| 8. Safe URL allowlisting | **PASS** | Only allowlisted SEBI/cybercrime hosts and `tel:1930` clickable |
| 9. Pause Pact `.ics` & WhatsApp share | **PASS** | Valid UTC VCALENDAR download & prefilled WhatsApp link |
| 10. Offline "I have already sent money" steps | **PASS** | Static 5-step details with 1930 helpline button |
| 11. Empty, error, advice refusal states | **PASS** | Clean error handling with `role="alert"` |
| 12. Accessibility (WCAG 2.2 AA) | **PASS** | Focus rings, touch targets >= 44px, semantic landmarks |
| 13. PWA Installation & caching | **PASS** | Precaches app shell, never caches API requests |
| 14. Build & Vitest test suite | **PASS** | `npm run build` & 21/21 unit tests pass cleanly |

---

## 4. What Was Skipped / Out of Scope

- **Hindi UI**: Prepared i18n structure for future language additions; Hindi strings were not requested for MVP.
- **Real Backend / LLM API Integration**: Frontend is mock-backed via hook boundary (`useAnalyze.ts`).
- **Notification Permission / Scheduled Reminders**: Voluntary pause pact generates client-side `.ics` files without requesting browser notification permissions.
