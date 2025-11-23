import { useState } from "react";
import type { GameSettings, OperationType } from "../types/game";
import HighScores from "./HighScores";
import "./MainMenu.css";

interface MainMenuProps {
  onStartGame: (settings: GameSettings) => void;
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  const [operation, setOperation] = useState<OperationType | null>(null);
  const [practiceMode, setPracticeMode] = useState<"all" | "specific" | null>(
    null
  );
  const [specificNumber, setSpecificNumber] = useState<number | null>(null);
  const [practiceDuration, setPracticeDuration] = useState<30 | 60 | 90>(60);
  const [showHighScores, setShowHighScores] = useState(false);

  const handleStartGame = () => {
    if (!operation) return;
    if (practiceMode === "specific" && specificNumber === null) return;

    const settings: GameSettings = {
      operation,
      practiceMode: practiceMode || "all",
      specificNumber:
        practiceMode === "specific" && specificNumber !== null
          ? specificNumber
          : undefined,
      practiceDuration,
    };

    onStartGame(settings);
  };

  const getNumberRange = (op: OperationType): number[] => {
    const max = op === "multiplication" || op === "division" ? 12 : 10;
    return Array.from({ length: max + 1 }, (_, i) => i);
  };

  return (
    <div className="main-menu">
      <h1 className="game-title">Calculate and Conquer</h1>
      <p className="game-subtitle">Shoot the correct answer!</p>

      <button
        className="high-scores-button"
        onClick={() => setShowHighScores(true)}
      >
        🏆 High Scores
      </button>

      <div className="menu-section">
        <h2>Choose Operation</h2>
        <div className="button-grid">
          <button
            className={`menu-button ${
              operation === "addition" ? "active" : ""
            }`}
            onClick={() => {
              setOperation("addition");
              setPracticeMode(null);
            }}
          >
            ➕ Addition
          </button>
          <button
            className={`menu-button ${
              operation === "subtraction" ? "active" : ""
            }`}
            onClick={() => {
              setOperation("subtraction");
              setPracticeMode(null);
            }}
          >
            ➖ Subtraction
          </button>
          <button
            className={`menu-button ${
              operation === "multiplication" ? "active" : ""
            }`}
            onClick={() => {
              setOperation("multiplication");
              setPracticeMode(null);
            }}
          >
            ✖️ Multiplication
          </button>
          <button
            className={`menu-button ${
              operation === "division" ? "active" : ""
            }`}
            onClick={() => {
              setOperation("division");
              setPracticeMode(null);
            }}
          >
            ➗ Division
          </button>
        </div>
      </div>

      {operation && (
        <div className="menu-section">
          <h2>Practice Mode</h2>
          <div className="button-grid">
            <button
              className={`menu-button ${
                practiceMode === "all" ? "active" : ""
              }`}
              onClick={() => setPracticeMode("all")}
            >
              🎲 Random Numbers
            </button>
            <button
              className={`menu-button ${
                practiceMode === "specific" ? "active" : ""
              }`}
              onClick={() => setPracticeMode("specific")}
            >
              🎯 Practice Specific Number
            </button>
          </div>
        </div>
      )}

      {practiceMode === "specific" && operation && (
        <div className="menu-section">
          <h2>Choose Number to Practice</h2>
          <div className="number-grid">
            {getNumberRange(operation).map((num) => (
              <button
                key={num}
                className={`number-button ${
                  specificNumber === num ? "active" : ""
                }`}
                onClick={() => setSpecificNumber(num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {operation && practiceMode && (
        <div className="menu-section">
          <h2>Practice Duration</h2>
          <div className="button-grid">
            <button
              className={`menu-button ${
                practiceDuration === 30 ? "active" : ""
              }`}
              onClick={() => setPracticeDuration(30)}
            >
              ⏱️ 30 Seconds
            </button>
            <button
              className={`menu-button ${
                practiceDuration === 60 ? "active" : ""
              }`}
              onClick={() => setPracticeDuration(60)}
            >
              ⏱️ 60 Seconds
            </button>
            <button
              className={`menu-button ${
                practiceDuration === 90 ? "active" : ""
              }`}
              onClick={() => setPracticeDuration(90)}
            >
              ⏱️ 90 Seconds
            </button>
          </div>
        </div>
      )}

      {operation &&
        practiceMode &&
        (practiceMode === "all" || specificNumber !== null) && (
          <button className="start-button" onClick={handleStartGame}>
            🚀 Start Game
          </button>
        )}

      {showHighScores && (
        <HighScores onClose={() => setShowHighScores(false)} />
      )}
    </div>
  );
}
