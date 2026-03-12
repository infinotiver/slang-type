# slang-type

## 0.2.2

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
