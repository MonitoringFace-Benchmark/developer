import { Link, NavLink, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import ConversionGraphs from './pages/ConversionGraphs';
import Tutorials from './pages/Tutorials';

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          MonitoringFace <span className="brand-sub">developer</span>
        </Link>
        <nav className="nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/conversions">Conversion Graphs</NavLink>
          <NavLink to="/tutorials">Tutorials</NavLink>
          <a href="https://monitoringface-benchmark.github.io/" target="_blank" rel="noreferrer">
            Experiments ↗
          </a>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/conversions" element={<ConversionGraphs />} />
          <Route path="/tutorials" element={<Tutorials />} />
        </Routes>
      </main>
    </div>
  );
}
