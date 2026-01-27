# SlangType

A modern typing speed test application with support for multiple languages and modes. Test your typing speed with slang, English, or code, across various time challenges and infinite mode.

## Features

- **Multiple Languages**: Test with slang, English, or code snippets
- **Various Modes**: 15s, 30s, 60s, 120s, and infinite mode
- **Display Modes**: Normal, tape-word, and tape-char visualization styles
- **Statistics Tracking**: WPM, accuracy, errors, and detailed performance metrics
- **History**: View all typing attempts with detailed analytics
- **Themes**: Dark, light, latte, frappe, mocha, nord, and gruvbox themes
- **Responsive Design**: Fully optimized for mobile and desktop
- **Local Persistence**: Your history and settings are saved locally
- **Performance Charts**: Visual representation of WPM progression

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
# Clone the repository
git clone infinotiver/slang-type

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Usage

1. Select your preferred language (slang, English, or code)
2. Choose a test mode (15s, 30s, 60s, 120s, or inf)
3. Click "click here to start typing" to begin
4. Type the displayed text as accurately and quickly as possible
5. View your results including WPM, accuracy, and error rate
6. Access your typing history from the header

### Settings

- **Theme**: Customize the color scheme
- **Display Mode**: Choose how text is displayed (normal, tape-word, tape-char)
- **Stats Display**: Toggle between normal and mini stats view

## Technologies

- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling and responsive design
- **Vite** - Build tool and dev server
- **Tabler Icons** - Icon library
- **Recharts** - Data visualization for performance charts


## Development

### Architecture

The app uses a modular component structure with custom hooks for state management:

- **useTypingEngine** - Core typing logic and character tracking
- **useTimer** - Countdown timer for test modes
- **useLocalStorage** - Persistent state management

Modal components are built on the reusable **ModalBase** component to reduce code duplication.

## Credits

Made with ❤️ by [infinotiver](https://github.com/infinotiver)
