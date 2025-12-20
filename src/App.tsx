
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing } from './features/landing/Landing';
import { Dashboard } from './features/negotiation/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
