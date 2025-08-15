
import React, { useState, useCallback } from 'react';
import { GameState } from './types';
import type { StorySegment } from './types';
import { generateStorySegment, generateSceneImage } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import ChoiceButton from './components/ChoiceButton';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [currentStory, setCurrentStory] = useState<StorySegment | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [storyHistory, setStoryHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadingMessages = [
    "The mists of fate are swirling...",
    "Forging a new path in the narrative...",
    "Painting your world with pixels and prose...",
    "Consulting the ancient oracles...",
    "The story is taking a dramatic turn...",
  ];
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  const fetchNextStep = useCallback(async (playerInput: string) => {
    setError(null);
    setStoryHistory(prev => [...prev, playerInput]);
    
    const messageInterval = setInterval(() => {
      setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 2500);

    try {
      const storySoFar = storyHistory.join(' -> ');
      const newStorySegment = await generateStorySegment(playerInput, storySoFar);

      if (!newStorySegment) {
        throw new Error("Failed to generate story segment.");
      }

      setCurrentStory(newStorySegment);
      
      // Check for game over before generating an image
      const isGameOver = newStorySegment.choices.some(c => c.toLowerCase().includes('the end'));
      if (isGameOver) {
        setCurrentImage(null);
        setGameState(GameState.GAME_OVER);
        clearInterval(messageInterval);
        return;
      }

      setLoadingMessage("Conjuring a vision of the scene...");
      const newImage = await generateSceneImage(newStorySegment.scene);
      setCurrentImage(newImage);
      setGameState(GameState.PLAYING);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setGameState(GameState.ERROR);
    } finally {
      clearInterval(messageInterval);
    }
  }, [storyHistory, loadingMessages]);

  const handleStartGame = () => {
    setGameState(GameState.LOADING);
    fetchNextStep("Begin a new fantasy adventure in a mysterious, ancient forest.");
  };

  const handleChoice = (choice: string) => {
    if (choice.toLowerCase().includes('the end')) {
        setGameState(GameState.GAME_OVER);
    } else {
        setGameState(GameState.LOADING);
        fetchNextStep(choice);
    }
  };

  const handlePlayAgain = () => {
    setGameState(GameState.START);
    setCurrentStory(null);
    setCurrentImage(null);
    setStoryHistory([]);
    setError(null);
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.START:
        return (
          <div className="text-center animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-cinzel font-bold text-amber-50 mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              Gemini Adventure
            </h1>
            <p className="text-lg md:text-xl font-lora text-slate-300 mb-8 max-w-2xl mx-auto">
              An epic journey crafted by AI. Your choices shape the story and the world around you.
            </p>
            <button
              onClick={handleStartGame}
              className="bg-amber-600 hover:bg-amber-500 text-white font-cinzel font-bold py-3 px-8 text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
              Begin Your Quest
            </button>
          </div>
        );

      case GameState.LOADING:
        return (
          <div className="text-center animate-fade-in">
            <LoadingSpinner />
            <p className="text-xl font-lora text-slate-300 mt-6 italic">{loadingMessage}</p>
          </div>
        );

      case GameState.PLAYING:
        if (!currentStory) return null;
        return (
          <div className="w-full max-w-4xl mx-auto animate-fade-in-slow">
            {currentImage && (
              <div className="mb-6 border-4 border-amber-800/50 rounded-lg shadow-2xl overflow-hidden">
                <img src={currentImage} alt="Scene" className="w-full h-auto" />
              </div>
            )}
            <div className="bg-slate-900/60 p-6 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700">
              <p className="font-lora text-slate-200 text-lg italic mb-4 whitespace-pre-wrap">{currentStory.scene}</p>
              <p className="font-lora text-slate-100 text-lg mb-6 whitespace-pre-wrap">{currentStory.situation}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentStory.choices.map((choice, index) => (
                  <ChoiceButton key={index} choice={choice} onChoose={handleChoice} />
                ))}
              </div>
            </div>
          </div>
        );

      case GameState.GAME_OVER:
        return (
          <div className="text-center animate-fade-in">
            <h2 className="text-6xl font-cinzel text-amber-100 mb-4">The End</h2>
            <p className="text-xl font-lora text-slate-300 mb-6">{currentStory?.situation || "Your adventure has concluded."}</p>
            <button
              onClick={handlePlayAgain}
              className="bg-amber-600 hover:bg-amber-500 text-white font-cinzel font-bold py-3 px-8 text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        );

      case GameState.ERROR:
        return (
          <div className="text-center bg-red-900/50 p-6 rounded-lg border border-red-500 animate-fade-in">
            <h2 className="text-4xl font-cinzel text-red-200 mb-4">An Unexpected Obstacle</h2>
            <p className="text-lg font-lora text-red-200 mb-6">{error}</p>
            <button
              onClick={handlePlayAgain}
              className="bg-slate-600 hover:bg-slate-500 text-white font-cinzel font-bold py-3 px-8 text-xl rounded-lg shadow-lg"
            >
              Start Anew
            </button>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 md:p-8 flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: "url('https://picsum.photos/seed/adventurebg/1920/1080')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div className="relative w-full z-10 flex items-center justify-center">
        {renderContent()}
      </div>
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-400 font-lora text-sm z-10">
        Made with Gemini
      </footer>
    </main>
  );
};

export default App;
