# slang-type

## 0.3.0 - 2026-03-13

### Minor Changes

- This release delivers a major account + history upgrade focused on reliability, sync safety, and richer performance data.

  ## Features

  - [feat(sync): add atomic results sync and history endpoints] [6b5d6f0]

    - Added server endpoints for saving and fetching typing history.
    - Added client API + sync hook for local-to-cloud sync on login.
    - Added atomic sync behavior so local data is only cleared after confirmed server success.

  - [feat(profile): merge history into profile and remove history icon] [0b979e6]

    - Merged profile and history flows into one page.
    - Removed the separate history icon from header navigation.
    - Added clearer sync and guest messaging UX.

  - [feat(results): persist extended raw metrics and payload data] [b29ffde]
    - Expanded persisted attempt data to include rich metrics and raw payload.
    - Added support for `rawWpm`, `adjustedWpm`, `errorRate`, `timePerChar`, `charsPerSecond`, `consistency`, `keystrokesPerSecond`, `targetText`, `charStatus`, and `performanceData`.

  ## Fixes

  - [fix(auth): prevent false login success and speed up auth paths] [ad7f7ab]
    - Fixed false-positive login flow when session payload was invalid.
    - Improved auth-path responsiveness and reliability.

  ## Others

  - [feat(sync): add atomic results sync and history endpoints] [6b5d6f0]

    - Added schema-tolerant handling in results history/sync APIs to reduce breakage on older databases.

  - [feat(profile): merge history into profile and remove history icon] [0b979e6]
    - Simplified routing/navigation around profile-history destination.

## 0.2.2 - 2026-03-12

### Patch Changes

- New TypingArea Engine & Simplified Results-page Charts

  Features

  - TypingArea: faster, smoother animations and transitions; start/resume overlay and a "start here" focus hint; improved auto-scroll to center the active character. [#290d41b]

  Fixes

  - Results chart: prevent plotting zero-error points by converting zeros to null (removes visual clutter). [#7598049]

  Others

  - Simplified and improved results charts and tooltip labels; removed accuracy axis and consolidated WPM lines. [#d55cd8e] [#0e6fb21]
  - Various type-safety and layout refinements across components.

## 0.2.1 - 2026-03-11

### Patch Changes

- 100 new Slangs and layout refactoring

  - Added 100 new slang words to the dictionary
  - Simplify page animations and padding
  - Remove tape modes (probably will be added in future)
  - Minor fixes

## 0.2.0 - 2026-03-02

### Minor Changes

- Code Generation Mode, UI updates

  - Javascript code generation mode for text generation using predefined templates.
  - UI updates:
    - Replaced the "i" icon in the footer with info icon from the lucide-react library.
    - Fixed localstorage issue while storing the attempt
    - Also fixed the issue with multiple reloads and localstorage issues
    - Simpler and cleaner result and history pages using the shared chart component

## 0.1.1 - 2026-03-02

### Patch Changes

- Fix typing accuracy and WPM scoring behavior:

  - Keep accuracy penalties after backtracking. Correcting previously mistyped characters now updates visual status in the typing area without refunding prior error impact on accuracy.
  - Standardize adjusted WPM everywhere to use `accuracy * rawWpm` for live metrics, results stats, chart progression, and saved attempts/history views.

## 0.1.0 - 2026-02-06

### Minor Changes

- **Feature**: Unified Results Page for Test Results and History Viewing

  - Combined the ResultsPage to handle both new test results and historical attempt details
  - Removed the separate detail view from HistoryPage - now redirects to ResultsPage with attemptId parameter
  - Added URL parameter support (`?attemptId=...`) for viewing historical attempts
  - Fixed React Compiler memoization error in useHistoryStats hook
  - Cleaned up unused imports in HistoryPage component

## 0.0.1 - 2026-02-06

### Patch Changes

- UI Enhancements: Typography, Framer Motion Animations, Structure refactoring
