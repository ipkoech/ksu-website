# Accessibility Manual Test Matrix

Use this matrix for release evidence. Record the browser, operating system,
assistive-technology name and version, date, tester, and linked finding for every
completed manual session. "Pending" means the check has not been performed; it
must not be interpreted as a pass.

Automated baseline on 2026-07-27: the four Chromium Playwright projects passed
the shared skip-link, preference-panel, persistence/reset, focus-restoration,
and serious/critical axe checks. Automated axe coverage does not establish WCAG
conformance.

| App | Journey | Keyboard | 200% zoom | 400% reflow | Reduced motion | Forced colours | Desktop SR | Mobile SR | Findings |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Public web | Homepage, navigation, announcements, and accessibility panel | Automated baseline passed; manual pending | Pending | Pending | Automated preference passed; manual pending | Pending | Pending | Pending | None recorded |
| Public web | Entity inquiry: open, validation, submit status, Escape, and focus return | Automated Escape/focus return passed; manual pending | Pending | Pending | Pending | Pending | Pending | Pending | None recorded |
| Public web | Programmes and admissions discovery | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Manual coverage required |
| Admin | Sign-in, repeated navigation bypass, and accessibility panel | Automated baseline passed; manual pending | Pending | Pending | Automated preference passed; manual pending | Pending | Pending | Pending | Authenticated journey coverage required |
| Admin | Dashboard navigation and a representative create/edit form | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Authenticated test account required |
| Research | Homepage, primary navigation, and accessibility panel | Automated baseline passed; manual pending | Pending | Pending | Automated preference passed; manual pending | Pending | Pending | Pending | None recorded |
| Research | Research discovery, filters, and detail content | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Manual coverage required |
| Library | Homepage, primary navigation, announcements, and accessibility panel | Automated baseline passed; manual pending | Pending | Pending | Automated preference passed; manual pending | Pending | Pending | Pending | None recorded |
| Library | Catalogue/search filters, results, empty states, and details | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Backend-backed journey coverage required |
| Library | Ask/support form and submission status | Pending | Pending | Pending | Pending | Pending | Pending | Pending | Manual coverage required |

## Session procedure

For each row:

1. Complete the journey using only the keyboard, including reverse navigation,
   menus, dialogs, errors, and focus restoration.
2. Check at 200% browser zoom and then at 400%/approximately 320 CSS-pixel
   viewport width. Verify that content reflows, text is not clipped, controls
   remain operable, and ordinary content does not require two-dimensional
   scrolling.
3. Enable operating-system reduced motion and the in-product preference. Verify
   that information remains available and moving content can be paused.
4. Enable Windows High Contrast or the platform's forced-colors equivalent.
   Verify text, focus, boundaries, icons, errors, and selected states.
5. Test the complete journey with a current desktop screen reader and browser,
   then with a current mobile screen reader and browser.
6. Replace "Pending" with the exact environment, date, and result. Link every
   defect and retest result in Findings.

Recommended combinations are NVDA with Firefox or Chrome on Windows, VoiceOver
with Safari on macOS, VoiceOver with Safari on iOS, and TalkBack with Chrome on
Android. Use versions supported by the project's release policy.
