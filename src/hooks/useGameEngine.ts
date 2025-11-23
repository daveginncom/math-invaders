import { useEffect, useReducer, useCallback, useRef } from "react";
import type {
  GameState,
  GameSettings,
  FallingAnswer,
  Bullet,
  MathProblem,
} from "../types/game";
import { generateProblem, generateWrongAnswers } from "../utils/mathUtils";
import { saveHighScore } from "../utils/highScores";

type GameAction =
  | { type: "START_GAME"; settings: GameSettings }
  | { type: "MOVE_PLAYER"; x: number }
  | { type: "SHOOT" }
  | { type: "UPDATE_BULLETS" }
  | { type: "UPDATE_GAME"; deltaTime: number }
  | { type: "UPDATE_TIMER"; deltaTime: number }
  | { type: "HIT_ANSWER"; answerId: string }
  | { type: "MISS_ANSWER"; answerId: string }
  | { type: "SHOW_CORRECT_ANSWER" }
  | { type: "NEXT_PROBLEM" }
  | { type: "GAME_OVER" }
  | { type: "RETURN_TO_MENU" };

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 60;
const ANSWER_SIZE = 50;
const BULLET_SPEED = 8;

function createInitialState(): GameState {
  return {
    status: "menu",
    settings: null,
    currentProblem: null,
    fallingAnswers: [],
    bullets: [],
    playerX: GAME_WIDTH / 2,
    score: 0,
    lives: 3,
    level: 1,
    showingAnswer: false,
    timeRemaining: 0,
  };
}

function generateNewProblem(settings: GameSettings): {
  problem: MathProblem;
  answers: FallingAnswer[];
} {
  const problem = generateProblem(settings.operation, settings.specificNumber);
  const wrongAnswers = generateWrongAnswers(problem.correctAnswer, 3);
  const allAnswers = [problem.correctAnswer, ...wrongAnswers];

  // Shuffle answers
  for (let i = allAnswers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
  }

  const spacing = GAME_WIDTH / (allAnswers.length + 1);
  const answers: FallingAnswer[] = allAnswers.map((value, index) => ({
    id: `answer-${Date.now()}-${index}`,
    value,
    x: spacing * (index + 1),
    y: 100, // Static position near top of screen
    speed: 0, // No falling movement
    isCorrect: value === problem.correctAnswer,
  }));

  return { problem, answers };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      const { problem, answers } = generateNewProblem(action.settings);
      return {
        ...createInitialState(),
        status: "playing",
        settings: action.settings,
        currentProblem: problem,
        fallingAnswers: answers,
        lives: 3,
        score: 0,
        level: 1,
        timeRemaining: action.settings.practiceDuration,
      };
    }

    case "MOVE_PLAYER":
      return {
        ...state,
        playerX: Math.max(
          PLAYER_SIZE / 2,
          Math.min(GAME_WIDTH - PLAYER_SIZE / 2, action.x)
        ),
      };

    case "SHOOT": {
      if (state.status !== "playing") return state;

      const bullet: Bullet = {
        id: `bullet-${Date.now()}`,
        x: state.playerX,
        y: GAME_HEIGHT - PLAYER_SIZE - 10,
        speed: BULLET_SPEED,
      };

      return {
        ...state,
        bullets: [...state.bullets, bullet],
      };
    }

    case "UPDATE_BULLETS": {
      // Update bullet positions and filter out bullets that left the screen
      const updatedBullets = state.bullets
        .map((bullet) => ({
          ...bullet,
          y: bullet.y - BULLET_SPEED,
        }))
        .filter((bullet) => bullet.y > 0);

      return {
        ...state,
        bullets: updatedBullets,
      };
    }

    case "HIT_ANSWER": {
      const answer = state.fallingAnswers.find((a) => a.id === action.answerId);
      if (!answer) return state;

      if (answer.isCorrect) {
        // Correct answer hit - increase score and generate new problem
        const newScore = state.score + 10;
        const newLevel = Math.floor(newScore / 50) + 1;

        if (!state.settings) return state;
        const { problem, answers } = generateNewProblem(state.settings);

        return {
          ...state,
          score: newScore,
          level: newLevel,
          currentProblem: problem,
          fallingAnswers: answers,
          bullets: [], // Clear bullets when new problem appears
        };
      } else {
        // Wrong answer hit - lose a life and show correct answer
        const newLives = state.lives - 1;

        if (newLives <= 0) {
          // Save high score if applicable
          if (state.settings) {
            saveHighScore(state.settings, state.score);
          }
          return {
            ...state,
            lives: 0,
            status: "gameOver",
            showingAnswer: true,
          };
        }

        return {
          ...state,
          lives: newLives,
          showingAnswer: true,
          bullets: [], // Clear bullets
        };
      }
    }

    case "SHOW_CORRECT_ANSWER": {
      return {
        ...state,
        showingAnswer: true,
      };
    }

    case "NEXT_PROBLEM": {
      if (!state.settings) return state;
      const { problem, answers } = generateNewProblem(state.settings);

      return {
        ...state,
        currentProblem: problem,
        fallingAnswers: answers,
        showingAnswer: false,
        bullets: [],
      };
    }

    case "MISS_ANSWER": {
      // Just remove the answer from the list
      return {
        ...state,
        fallingAnswers: state.fallingAnswers.filter(
          (a) => a.id !== action.answerId
        ),
      };
    }

    case "UPDATE_GAME": {
      if (state.status !== "playing") return state;
      // No updates needed for static answers
      return state;
    }

    case "UPDATE_TIMER": {
      if (state.status !== "playing") return state;
      const newTimeRemaining = Math.max(
        0,
        state.timeRemaining - action.deltaTime
      );

      // Check if time has run out
      if (newTimeRemaining === 0 && state.timeRemaining > 0) {
        // Save high score when time runs out
        if (state.settings) {
          saveHighScore(state.settings, state.score);
        }
        return {
          ...state,
          timeRemaining: 0,
          status: "gameOver",
        };
      }

      return {
        ...state,
        timeRemaining: newTimeRemaining,
      };
    }

    case "GAME_OVER":
      return {
        ...state,
        status: "gameOver",
      };

    case "RETURN_TO_MENU":
      return createInitialState();

    default:
      return state;
  }
}

export function useGameEngine() {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const stateRef = useRef(state);

  // Keep stateRef in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Handle showing correct answer after wrong answer
  useEffect(() => {
    if (state.showingAnswer && state.status !== "gameOver") {
      const timer = setTimeout(() => {
        dispatch({ type: "NEXT_PROBLEM" });
      }, 2000); // Show answer for 2 seconds

      return () => clearTimeout(timer);
    }
  }, [state.showingAnswer, state.status]);

  useEffect(() => {
    const gameLoop = () => {
      const now = Date.now();
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = now;
      }
      const deltaTime = (now - lastTimeRef.current) / 16.67; // Normalize to 60fps
      lastTimeRef.current = now;

      // Update timer (deltaTime in frames at 60fps, convert to seconds)
      dispatch({ type: "UPDATE_TIMER", deltaTime: deltaTime / 60 });

      // Update game state
      dispatch({ type: "UPDATE_GAME", deltaTime });

      // Update bullets
      dispatch({ type: "UPDATE_BULLETS" });

      // Check collisions
      const hitAnswers = new Set<string>();

      for (const bullet of stateRef.current.bullets) {
        for (const answer of stateRef.current.fallingAnswers) {
          if (hitAnswers.has(answer.id)) continue;

          const distance = Math.sqrt(
            Math.pow(bullet.x - answer.x, 2) + Math.pow(bullet.y - answer.y, 2)
          );

          if (distance < ANSWER_SIZE / 2) {
            hitAnswers.add(answer.id);
            dispatch({ type: "HIT_ANSWER", answerId: answer.id });
            break;
          }
        }
      }

      if (stateRef.current.status === "playing") {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      }
    };

    if (state.status === "playing") {
      lastTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.status]);

  const startGame = useCallback((settings: GameSettings) => {
    dispatch({ type: "START_GAME", settings });
  }, []);

  const movePlayer = useCallback((x: number) => {
    dispatch({ type: "MOVE_PLAYER", x });
  }, []);

  const shoot = useCallback(() => {
    dispatch({ type: "SHOOT" });
  }, []);

  const returnToMenu = useCallback(() => {
    dispatch({ type: "RETURN_TO_MENU" });
  }, []);

  return {
    state,
    startGame,
    movePlayer,
    shoot,
    returnToMenu,
    constants: {
      GAME_WIDTH,
      GAME_HEIGHT,
      PLAYER_SIZE,
      ANSWER_SIZE,
    },
  };
}
