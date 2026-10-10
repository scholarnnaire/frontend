import { useState, useEffect, useRef } from 'react';

export function useGameState(playerId) {
  const [gameState, setGameState] = useState(null); // 'active', 'finished'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  // Game state
  const [rung, setRung] = useState(0);
  const [inMomentum, setInMomentum] = useState(false);
  const [inDownfall, setInDownfall] = useState(false);
  
  // Object containing boolean flags for each lifeline
  const [lifelines, setLifelines] = useState({
    phone_a_scholar: true,
    flip_a_book: true,
    search_the_net: true
  });
  
  // Lock tracking (first-press wins)
  const [lifelineLocks, setLifelineLocks] = useState({
    phone_a_scholar: null,
    flip_a_book: null,
    search_the_net: null
  });

  const ws = useRef(null);

  useEffect(() => {
    // Default to localhost:8000 if env variable is not set
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    ws.current = new WebSocket(`${wsUrl}/ws/${playerId}`);

    ws.current.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      
      switch (payload.event) {
        case 'GAME_STARTED':
          setGameState('active');
          // Request first question automatically
          ws.current.send(JSON.stringify({ action: 'GET_QUESTION', player_id: playerId }));
          break;
        case 'QUESTION_DATA':
          if (payload.data.status === 'finished') {
            setGameState('finished');
          } else {
            setCurrentQuestion(payload.data.question_data);
            setRung(payload.data.rung);
            setInMomentum(payload.data.in_momentum);
            setInDownfall(payload.data.in_downfall);
            setLifelines(payload.data.lifelines);
            setLifelineLocks(payload.data.lifeline_locks);
          }
          break;
        case 'ANSWER_RESULT':
          setRung(payload.data.rung);
          setInMomentum(payload.data.in_momentum);
          setInDownfall(payload.data.in_downfall);
          
          // Wait briefly to allow the user to see the result, then fetch next
          setTimeout(() => {
            ws.current.send(JSON.stringify({ action: 'GET_QUESTION', player_id: playerId }));
          }, 2000); 
          break;
        case 'LIFELINE_RESULT':
          if (payload.data.success) {
            setLifelines(payload.data.lifelines_state);
            setLifelineLocks(payload.data.locks);
          } else {
            console.warn("Lifeline failed:", payload.data.error);
          }
          break;
        case 'LIFELINE_LOCKED':
          setLifelineLocks(payload.locks);
          break;
        default:
          console.log("Unhandled event:", payload);
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [playerId]);

  const startGame = () => {
    if (ws.current) ws.current.send(JSON.stringify({ action: 'START_GAME' }));
  };

  const answerQuestion = (answerIndex) => {
    if (ws.current) {
      ws.current.send(JSON.stringify({
        action: 'ANSWER_QUESTION',
        player_id: playerId,
        answer_index: answerIndex
      }));
    }
  };

  const useLifeline = (lifelineId) => {
    if (ws.current && lifelines[lifelineId]) {
      ws.current.send(JSON.stringify({
        action: 'USE_LIFELINE',
        player_id: playerId,
        lifeline_id: lifelineId
      }));
    }
  };

  return {
    gameState,
    currentQuestion,
    rung,
    inMomentum,
    inDownfall,
    lifelines,
    lifelineLocks,
    startGame,
    answerQuestion,
    useLifeline
  };
}
