import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './routes/Home';
import { GameDollar } from './routes/GameDollar';
import { GameArea } from './routes/GameArea';
import { Result } from './routes/Result';
import { Settings } from './routes/Settings';
import './index.css';

function App() {
  return (
    <Router>
      {/* 전체 배경 - 콘솔 색상 */}
      <div className="min-h-screen bg-console-bg">
        {/* 모바일 최적화 컨테이너 - 355px 너비 기준 */}
        <div className="mx-auto max-w-[355px] min-h-screen bg-console-bg shadow-lg overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/dollar" element={<GameDollar />} />
            <Route path="/game/area" element={<GameArea />} />
            <Route path="/result" element={<Result />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
