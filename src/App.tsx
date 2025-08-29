import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Home } from './routes/Home';
import { GameDollar } from './routes/GameDollar';
import { GameArea } from './routes/GameArea';
import { GameVerification } from './routes/GameVerification';
import { GameDream } from './routes/GameDream';
import { GameReaction } from './routes/GameReaction';
import GameRPS from './routes/GameRPS';
import GameRPSBurning from './routes/GameRPSBurning';
import { Result } from './routes/Result';
import { BurningResult } from './routes/BurningResult';
import { Settings } from './routes/Settings';
import { ReleaseNotes } from './routes/ReleaseNotes';
import './index.css';

function App() {
  return (
    <Router>
      {/* 전체 배경 - 콘솔 색상 */}
      <div className="min-h-screen bg-console-bg">
        {/* 모바일 최적화 컨테이너 - 355px 너비 기준 */}
        <div className="mx-auto max-w-[355px] min-h-screen bg-console-bg shadow-lg overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/dollar" element={<GameDollar />} />
            <Route path="/game/area" element={<GameArea />} />
            <Route path="/game/verification" element={<GameVerification />} />
            <Route path="/game/dream" element={<GameDream />} />
            <Route path="/game/reaction" element={<GameReaction />} />
            <Route path="/game/rps" element={<GameRPS />} />
            <Route path="/game/rps-burning" element={<GameRPSBurning />} />
            <Route path="/result" element={<Result />} />
            <Route path="/burning-result" element={<BurningResult />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/release-notes" element={<ReleaseNotes />} />
          </Routes>
        </div>
      </div>
      <Analytics />
    </Router>
  );
}

export default App;
