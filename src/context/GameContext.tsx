import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

interface GameContextType {
  isPlaying: boolean;
  startGame: () => void;
  endGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const startGame = () => setIsPlaying(true);
  const endGame = () => setIsPlaying(false);

  return (
    <GameContext.Provider value={{ isPlaying, startGame, endGame }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
