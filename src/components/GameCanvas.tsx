import { useEffect, useRef } from "react";
import type { GameState } from "../types/game";
import { formatProblem } from "../utils/mathUtils";
import { getHighScore } from "../utils/highScores";
import "./GameCanvas.css";

interface GameCanvasProps {
  state: GameState;
  onPlayerMove: (x: number) => void;
  onShoot: () => void;
  onReturnToMenu: () => void;
  constants: {
    GAME_WIDTH: number;
    GAME_HEIGHT: number;
    PLAYER_SIZE: number;
    ANSWER_SIZE: number;
  };
}

export default function GameCanvas({
  state,
  onPlayerMove,
  onShoot,
  onReturnToMenu,
  constants,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { GAME_WIDTH, GAME_HEIGHT, PLAYER_SIZE, ANSWER_SIZE } = constants;

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.status !== "playing") return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          onPlayerMove(Math.max(PLAYER_SIZE / 2, state.playerX - 20));
          break;
        case "ArrowRight":
          e.preventDefault();
          onPlayerMove(
            Math.min(GAME_WIDTH - PLAYER_SIZE / 2, state.playerX + 20)
          );
          break;
        case " ":
        case "Space":
          e.preventDefault();
          onShoot();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    state.status,
    state.playerX,
    onPlayerMove,
    onShoot,
    GAME_WIDTH,
    PLAYER_SIZE,
  ]);

  // Handle touch/mouse controls
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (state.status !== "playing") return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = GAME_WIDTH / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    onPlayerMove(x);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (state.status !== "playing") return;

    // Only fire immediately on mouse (non-touch)
    if (e.pointerType === "mouse") {
      onShoot();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (state.status !== "playing") return;

    // Fire on release for touch devices
    if (e.pointerType === "touch" || e.pointerType === "pen") {
      onShoot();
    }
  };

  if (state.status === "gameOver") {
    const highScore = state.settings ? getHighScore(state.settings) : 0;
    const isNewHighScore = state.score > 0 && state.score === highScore;

    return (
      <div className="game-over">
        <h1>Game Over!</h1>
        {isNewHighScore && (
          <p className="new-high-score">🎉 New High Score! 🎉</p>
        )}
        <p className="final-score">Final Score: {state.score}</p>
        {highScore > 0 && !isNewHighScore && (
          <p className="high-score">High Score: {highScore}</p>
        )}
        <p className="final-level">Level Reached: {state.level}</p>
        <button className="menu-button" onClick={onReturnToMenu}>
          Return to Menu
        </button>
      </div>
    );
  }

  if (!state.currentProblem) return null;

  const highScore = state.settings ? getHighScore(state.settings) : 0;
  const timeDisplay = Math.ceil(state.timeRemaining);

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="score">
          Score: {state.score}
          {highScore > 0 && (
            <div className="high-score-small">High: {highScore}</div>
          )}
        </div>
        <div className="problem">{formatProblem(state.currentProblem)}</div>
        <div className="game-stats">
          <div className="lives">Lives: {"❤️".repeat(state.lives)}</div>
          <div className="timer">⏱️ {timeDisplay}s</div>
        </div>
      </div>

      <div
        ref={canvasRef}
        className="game-canvas"
        style={{
          width: "100%",
          maxWidth: `${GAME_WIDTH}px`,
          aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`,
        }}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {/* Falling answers */}
        {state.fallingAnswers.map((answer) => (
          <div
            key={answer.id}
            className={`falling-answer ${
              state.showingAnswer && answer.isCorrect ? "show-correct" : ""
            }`}
            style={{
              left: `${(answer.x / GAME_WIDTH) * 100}%`,
              top: `${(answer.y / GAME_HEIGHT) * 100}%`,
              width: `${(ANSWER_SIZE / GAME_WIDTH) * 100}%`,
              height: `${(ANSWER_SIZE / GAME_HEIGHT) * 100}%`,
            }}
          >
            {answer.value}
          </div>
        ))}

        {/* Bullets */}
        {state.bullets.map((bullet) => (
          <div
            key={bullet.id}
            className="bullet"
            style={{
              left: `${(bullet.x / GAME_WIDTH) * 100}%`,
              top: `${(bullet.y / GAME_HEIGHT) * 100}%`,
            }}
          />
        ))}

        {/* Player */}
        <div
          className="player"
          style={{
            left: `${(state.playerX / GAME_WIDTH) * 100}%`,
            bottom: "20px",
            width: `${(PLAYER_SIZE / GAME_WIDTH) * 100}%`,
            height: `${(PLAYER_SIZE / GAME_HEIGHT) * 100}%`,
          }}
        >
          🚀
        </div>
      </div>

      <div className="game-controls">
        <button
          className="control-button"
          onClick={() => onPlayerMove(state.playerX - 30)}
        >
          ⬅️
        </button>
        <button className="control-button shoot" onClick={onShoot}>
          🔥 SHOOT
        </button>
        <button
          className="control-button"
          onClick={() => onPlayerMove(state.playerX + 30)}
        >
          ➡️
        </button>
      </div>

      <div className="game-info">
        <p>Use arrow keys or touch to move • Space or tap to shoot</p>
      </div>
    </div>
  );
}
