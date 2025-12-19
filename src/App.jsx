import { useState, useEffect } from 'react';
import './App.css';

// Placeholder imports for rooms (we'll create these next)
import RoomConnection from './components/rooms/RoomConnection';
import RoomInteraction from './components/rooms/RoomInteraction';
import RoomGrowth from './components/rooms/RoomGrowth';
import RoomCollaboration from './components/rooms/RoomCollaboration';
import RoomReflection from './components/rooms/RoomReflection';
import RoomResolution from './components/rooms/RoomResolution';
import RoomBurden from './components/rooms/RoomBurden'; // Import Burden room
import RoomReconstruction from './components/rooms/RoomReconstruction';
import RoomNewsPile from './components/rooms/RoomNewsPile';

import PhysiologyMonitor from './components/PhysiologyMonitor';

const ROOMS = [
  { id: 'news-pile', component: RoomNewsPile, label: 'SILENT EVIDENCE' },
  { id: 'burden', component: RoomBurden, label: 'Healing Pathways' },
  { id: 'connection', component: RoomConnection, label: 'Global Data Audit' },
  { id: 'reflection', component: RoomReflection, label: 'Show Invisibility' },
  { id: 'reconstruction', component: RoomReconstruction, label: 'Reconstruction' },
  { id: 'growth', component: RoomGrowth, label: 'Systemic Link' },
  { id: 'resolution', component: RoomResolution, label: 'Solution' },
  { id: 'interaction', component: RoomInteraction, label: 'System Support' },
];

import IntroPage from './components/IntroPage';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleIntroComplete = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowIntro(false);
      setIsTransitioning(false);
    }, 1000);
  };

  const nextRoom = () => {
    if (currentRoomIndex < ROOMS.length - 1 && !isTransitioning) {
      changeRoom(currentRoomIndex + 1);
    }
  };

  const prevRoom = () => {
    if (currentRoomIndex > 0 && !isTransitioning) {
      changeRoom(currentRoomIndex - 1);
    }
  };

  const changeRoom = (index) => {
    setIsTransitioning(true);
    // Simple transition delay simulation
    setTimeout(() => {
      setCurrentRoomIndex(index);
      setIsTransitioning(false);
    }, 500); // Wait for fade out
  };

  const CurrentRoomComponent = ROOMS[currentRoomIndex].component;

  const activeRoomId = ROOMS[currentRoomIndex].id;
  const stressLevel = (activeRoomId === 'reconstruction' || activeRoomId === 'growth') ? 'high' : 'normal';

  return (
    <div className="app-container">
      {showIntro ? (
        <IntroPage onComplete={handleIntroComplete} />
      ) : (
        <>
          <PhysiologyMonitor stressLevel={stressLevel} />
          <main className={`room-container ${isTransitioning ? 'fading-out' : 'fading-in'}`}>
            {CurrentRoomComponent ? <CurrentRoomComponent isActive={!isTransitioning} onNavigate={changeRoom} /> : <div>Room not implemented</div>}
          </main>

          <nav className="navigation-ui">
            <div className="room-indicator">
              {ROOMS.map((room, index) => (
                <span
                  key={room.id}
                  className={`dot ${index === currentRoomIndex ? 'active' : ''}`}
                />
              ))}
            </div>
            <div className="controls">
              <button onClick={prevRoom} disabled={currentRoomIndex === 0}>
                Prev
              </button>
              <span className="current-label">{ROOMS[currentRoomIndex].label}</span>
              <button onClick={nextRoom} disabled={currentRoomIndex === ROOMS.length - 1}>
                Next
              </button>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}

export default App;
