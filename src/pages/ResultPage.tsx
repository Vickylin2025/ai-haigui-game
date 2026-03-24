
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext'; // Import useGame hook

interface Dialogue {
  speaker: string;
  text: string;
}

interface ResultPageProps {
  storyTitle?: string;
  soupBase?: string;
  dialogueHistory?: Dialogue[];
}

const ResultPage: React.FC<ResultPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { endGame } = useGame(); // Use endGame from context
  const { storyTitle, soupBase, dialogueHistory } = location.state || {};

  const [revealSoupBase, setRevealSoupBase] = useState(false);

  useEffect(() => {
    endGame(); // End the game when ResultPage mounts
    // Trigger the reveal animation after a short delay
    const timer = setTimeout(() => {
      setRevealSoupBase(true);
    }, 1000); // 1 second delay for dramatic effect
    return () => clearTimeout(timer);
  }, [endGame]);

  const handlePlayAgain = () => {
    navigate('/'); // Navigate to the home page (lobby)
  };

  return (
    <div className="result-page p-4 md:p-8 lg:p-12 min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-yellow-400">游戏结果</h1>

      {storyTitle && (
        <h2 className="text-2xl md:text-3xl mb-8 text-center">{storyTitle}</h2>
      )}

      <div className="soup-base-section bg-gray-800 p-6 rounded-lg shadow-lg mb-8 max-w-2xl w-full text-center">
        <h3 className="text-xl md:text-2xl font-semibold mb-4 text-red-400">汤底揭晓:</h3>
        <p
          className={`soup-base-content text-lg md:text-xl leading-relaxed transition-opacity duration-1000 ease-in ${
            revealSoupBase ? 'opacity-100' : 'opacity-0'
          } ${revealSoupBase ? 'block' : 'hidden'}`}
          style={{ transitionDelay: '500ms' }} // Delay opacity transition slightly after component mounts
        >
          {soupBase || '暂无汤底内容。'}
        </p>
      </div>

      {dialogueHistory && dialogueHistory.length > 0 && (
        <div className="dialogue-history-section bg-gray-800 p-6 rounded-lg shadow-lg mb-8 max-w-2xl w-full">
          <h3 className="text-xl md:text-2xl font-semibold mb-4 text-blue-400">对话历史:</h3>
          <ul className="dialogue-list text-left max-h-60 overflow-y-auto custom-scrollbar">
            {dialogueHistory.map((dialogue: Dialogue, index: number) => (
              <li key={index} className="mb-2 text-gray-300">
                <span className="font-bold text-white">{dialogue.speaker}:</span> {dialogue.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handlePlayAgain}
        className="play-again-button bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full text-xl md:text-2xl transition duration-300 ease-in-out transform hover:scale-105"
      >
        再来一局
      </button>
    </div>
  );
};

export default ResultPage;
