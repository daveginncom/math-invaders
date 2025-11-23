# Calculate and Conquer 🚀

A fun, educational space-invaders-style math game for young children to practice their math facts!

## Features

- **Multiple Operations**: Addition, subtraction, multiplication, and division
- **Practice Modes**:
  - Random numbers: Practice with all numbers in the range
  - Specific number: Focus on a particular number (e.g., practice multiplying by 5)
- **Responsive Design**: Works on both desktop and mobile devices
- **Progressive Difficulty**: Game speed increases as you level up
- **Kid-Friendly UI**: Colorful, engaging interface with emojis

## Number Ranges

- **Addition & Subtraction**: 0-10
- **Multiplication & Division**: 0-12

## How to Play

1. Choose your operation type (addition, subtraction, multiplication, or division)
2. Select practice mode (random or specific number)
3. Shoot the falling answers that match the math problem displayed at the top
4. Earn points for correct answers
5. Avoid shooting wrong answers or letting correct answers fall!

### Controls

**Desktop:**

- Arrow keys (← →) to move
- Spacebar to shoot

**Mobile/Tablet:**

- Touch and drag to move your ship
- Tap to shoot
- Use on-screen buttons for easy control

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Run Tests

```bash
npm test        # Watch mode
npm run test:run # Single run
```

### Build for Production

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── MainMenu.tsx        # Game menu for selecting options
│   ├── MainMenu.css
│   ├── GameCanvas.tsx      # Main game rendering component
│   └── GameCanvas.css
├── hooks/
│   └── useGameEngine.ts    # Core game logic and state management
├── types/
│   └── game.ts             # TypeScript type definitions
├── utils/
│   ├── mathUtils.ts        # Math problem generation utilities
│   └── mathUtils.test.ts   # Tests for math utilities
└── test/
    └── setup.ts            # Test configuration
```

## Testing

The project includes comprehensive tests for:

- Math problem generation
- Answer validation
- Problem formatting
- Component rendering

Tests are automatically run in CI/CD pipeline via GitHub Actions.

## Pre-commit Hooks

The project uses Husky to run ESLint on staged files before commits. This ensures code quality and prevents lint errors from being committed.

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **ESLint** - Code linting
- **Husky** - Git hooks

## License

MIT
