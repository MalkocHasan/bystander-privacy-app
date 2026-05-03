
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './features/landing/Landing';
import { Dashboard } from './features/negotiation/Dashboard';
import { useHomeStore } from './store/useHomeStore';

function App() {
  const isConnected = useHomeStore((state) => state.isConnected);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/dashboard"
          element={isConnected ? <Dashboard /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
