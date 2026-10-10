import { useState, useEffect, useRef } from 'react';

export function useViewerState(role = "viewer") {
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'active'
  const [playerStates, setPlayerStates] = useState({
    player1: { rung: 0, score: 0, in_momentum: false, in_downfall: false },
    player2: { rung: 0, score: 0, in_momentum: false, in_downfall: false }
  });
  
  const ws = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    ws.current = new WebSocket(`${wsUrl}/ws/${role}`);

    ws.current.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      
      switch (payload.event) {
        case 'GAME_STARTED':
          setGameState('active');
          setPlayerStates({
            player1: { rung: 0, score: 0, in_momentum: false, in_downfall: false },
            player2: { rung: 0, score: 0, in_momentum: false, in_downfall: false }
          });
          break;
        case 'LADDER_UPDATE':
          // The backend now sends the full player state dict on answer
          setPlayerStates(payload.state);
          break;
        default:
          break;
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [role]);

  const startGame = () => {
    if (ws.current) ws.current.send(JSON.stringify({ action: 'START_GAME' }));
  };

  return {
    gameState,
    playerStates,
    startGame
  };
}
