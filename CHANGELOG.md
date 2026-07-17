# slang-type
## 0.4.2 (2026-07-17)

### Features

* **ai**: switch AI text generation backend to Groq API ([6fab20d](https://github.com/infinotiver/slang-type/commit/6fab20db8930024d4a95c0beda00e9173904a5f8))
* **settings**: add live theme previews to theme selector ([e1d89e4](https://github.com/infinotiver/slang-type/commit/e1d89e4aa44f4a52737ec550bb1db14ec88843c1))

### Fixes

* **history**: fix ordering of history data so charts remain chronological while attempt lists display newest first ([4b50438](https://github.com/infinotiver/slang-type/commit/4b50438b749e9a152fb3515c0ccdfe972a82a0f3))

### Styles

* **settings**: simplify settings modal layout and organization ([becdfac](https://github.com/infinotiver/slang-type/commit/becdfac6d54b6dbdd71fb8fe4fbe270e0a915a5c))
* **ui**: improve contrast and reorganize option chips into responsive grids ([9f81c26](https://github.com/infinotiver/slang-type/commit/9f81c262ce71850c0b78dde37302ff01787f3521))
* **ui**: refresh styling across the application ([7a436b5](https://github.com/infinotiver/slang-type/commit/7a436b5e85c4a6533a20714038888b9f158e0c3d))

### Documentation

* **readme**: add demo gallery ([31efd31](https://github.com/infinotiver/slang-type/commit/31efd31959bc5c2ceb0a5bee05b1beebf3a547d3))
* **readme**: update documentation and remove inappropriate words ([ad8f93f](https://github.com/infinotiver/slang-type/commit/ad8f93f3bd623885bd8a1b1dba56f1100687a597))
* **docs**: general documentation cleanup ([47d4968](https://github.com/infinotiver/slang-type/commit/47d49683d834a683be95a8e2a30bf1d8b39e4305))

### Chores

* **license**: add project LICENSE ([0c35eb0](https://github.com/infinotiver/slang-type/commit/0c35eb0fe62eaf50a990c9ad1497ee21e71e66e5))


## 0.4.1 (2026-07-08)

### Features
* **typing**: add two live typing metrics display mode ([a40c8e0](https://github.com/infinotiver/slang-type/commit/a40c8e0))
* **history**: restore history page ([ac382e2](https://github.com/infinotiver/slang-type/commit/ac382e2))
* **results**: add error statistics to history page and calculations ([35de158](https://github.com/infinotiver/slang-type/commit/35de158))
* **effects**: add sound effects ([f8fc46a](https://github.com/infinotiver/slang-type/commit/f8fc46a))
* **generation**: implement code phrase generation using external javascript snippets ([52cc5c5](https://github.com/infinotiver/slang-type/commit/52cc5c5))
* **auth**: add username validation on signup ([e347379](https://github.com/infinotiver/slang-type/commit/e347379))
* **cleanup**: remove backend for rewrite ([494dca6](https://github.com/infinotiver/slang-type/commit/494dca6))

### Refactor
* **history**: show attempt details in list item itself, remove attempt view in history page ([4d19df1](https://github.com/infinotiver/slang-type/commit/4d19df1))


### Fixes
* **typing-area**: resolve broken auto-scroll and janky cursor animation ([d9a6bd7](https://github.com/infinotiver/slang-type/commit/d9a6bd7))
* **input**: fix typing space as first letter of word issue ([479d9e2](https://github.com/infinotiver/slang-type/commit/479d9e2))
* **ui**: update modal backdrop styling for improved visibility ([bc0709b](https://github.com/infinotiver/slang-type/commit/bc0709b))

### Styles
* **design**: redesign with fully rounded corners ([44cb067](https://github.com/infinotiver/slang-type/commit/44cb067))
* **redesign**: extend redesign to UI components ([edf83a0](https://github.com/infinotiver/slang-type/commit/edf83a0))
* **metrics**: update livemetrics to bold info ([e74a90b](https://github.com/infinotiver/slang-type/commit/e74a90b))
* **layout**: reduce unnecessary nesting ([f1b8408](https://github.com/infinotiver/slang-type/commit/f1b8408))
* **metrics**: update metrics to pill-shaped design ([f1c389](https://github.com/infinotiver/slang-type/commit/f1c389))
* **themes**: add 'bold' theme with custom colors ([4fd326b](https://github.com/infinotiver/slang-type/commit/4fd326b))
* **history**: add pills design ([459a400](https://github.com/infinotiver/slang-type/commit/459a400))
* **redesign**: extend redesign to history and results page ([dd61cec](https://github.com/infinotiver/slang-type/commit/dd61cec))

### Refactor
* **ui**: update ai words modal ([3c966ee](https://github.com/infinotiver/slang-type/commit/3c966ee))
* **ui**: update credits modal ([a22c01e](https://github.com/infinotiver/slang-type/commit/a22c01e))
* **stats**: streamline results statistics calculations ([48238e4](https://github.com/infinotiver/slang-type/commit/48238e4))

### Chores
* **deps**: add conventional-changelog ([098bc23](https://github.com/infinotiver/slang-type/commit/098bc23))

## 0.3.2 (2026-04-29)

### Patch Changes

- ### Fixes
  - An issue where typing one word wrong would shift the entire sentence and cause all subsequent words to be marked wrong, even if they were typed correctly. [#7b1bd35]
  - Update favicon [#62fbcce]
  - Simplify unncessarily complex words in English set [#44faf1f]
  - Smooth scroll only when the screen is to be scrolled and not for each word typed [#a5e8de5c]
  - Vercel routes and rewrites config
  - Other minor fixes

## 0.3.1 (2026-04-07)

### Patch Changes

### Features

- implement global usage tracking and summary table
- unified auth page
- log out using dropdown
- move header controls to a dropdown
- make AI a native mode
- test checks before saving
- migrate DB usage tracking fully to requests instead of token usage
- add Vercel routes for hosting
- flag and display AI-generated sessions across app

### Fixes

- update class attributes
- standardize date handling in token queries
- ensure attempt IDs are converted to proper UUIDs
- remove routes in Vercel

## 0.3.0 (2026-03-16)

### Minor Changes

- ## Features

  - Add full auth flow (JWT-based server routes, AuthProvider, protected pages, login/signup UI) [#0f36b29] [#4348626] [#cfb26f0] [#db84700] [#6a32f75]
  - Add Gemini word generation proxy with daily token quota and profile quota display [#36dfd34] [#52ad829] [#7e19f11]
  - Add overview stats API/typing stats improvements and shared top bar component reused across pages [#64fc0a8] [#7a15724]

  ## Fixes

  - Use POSTGRES_URL connection string and align stats endpoint paths [#cde4762] [#2e7f142]
  - Tolerate duplicate result syncs and improve logging during sync [#b3d931e]

  ## Others

  - Drop heavy result payload fields to cut DB/storage bloat [#e595370]
  - Standardize numeric/accuracy formatting and profile duration formatting [#8bf5f41] [#29fabf0] [#fec6f97]

## 0.2.2 (2026-03-12)

### Patch Changes

- New TypingArea Engine & Simplified Results-page Charts

  Features

  - TypingArea: faster, smoother animations and transitions; start/resume overlay and a "start here" focus hint; improved auto-scroll to center the active character. [#290d41b]

  Fixes

  - Results chart: prevent plotting zero-error points by converting zeros to null (removes visual clutter). [#7598049]

  Others

  - Simplified and improved results charts and tooltip labels; removed accuracy axis and consolidated WPM lines. [#d55cd8e] [#0e6fb21]
  - Various type-safety and layout refinements across components.

## 0.2.1 (026-03-11)

### Patch Changes

- 100 new Slangs and layout refactoring

  - Added 100 new slang words to the dictionary
  - Simplify page animations and padding
  - Remove tape modes (probably will be added in future)
  - Minor fixes

## 0.2.0 (026-03-02)

### Minor Changes

- Code Generation Mode, UI updates

  - Javascript code generation mode for text generation using predefined templates.
  - UI updates:
    - Replaced the "i" icon in the footer with info icon from the lucide-react library.
    - Fixed localstorage issue while storing the attempt
    - Also fixed the issue with multiple reloads and localstorage issues
    - Simpler and cleaner result and history pages using the shared chart component

## 0.1.1 (2026-03-02)

### Patch Changes

- Fix typing accuracy and WPM scoring behavior:

  - Keep accuracy penalties after backtracking. Correcting previously mistyped characters now updates visual status in the typing area without refunding prior error impact on accuracy.
  - Standardize adjusted WPM everywhere to use `accuracy * rawWpm` for live metrics, results stats, chart progression, and saved attempts/history views.

## 0.1.0 (2026-02-06)

### Minor Changes

- **Feature**: Unified Results Page for Test Results and History Viewing

  - Combined the ResultsPage to handle both new test results and historical attempt details
  - Removed the separate detail view from HistoryPage - now redirects to ResultsPage with attemptId parameter
  - Added URL parameter support (`?attemptId=...`) for viewing historical attempts
  - Fixed React Compiler memoization error in useHistoryStats hook
  - Cleaned up unused imports in HistoryPage component

## 0.0.1 (2026-02-06)

### Patch Changes

- UI Enhancements: Typography, Framer Motion Animations, Structure refactoring
