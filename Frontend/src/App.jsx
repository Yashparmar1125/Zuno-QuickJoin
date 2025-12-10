import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import MeetingRoom from './pages/MeetingRoom';
import CallEnded from './pages/CallEnded';
import Dashboard from './pages/Dashboard';
import MeetingDetails from './pages/MeetingDetails';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-zuno-soft text-zuno-charcoal">
          <Routes>
            <Route path="/meeting/:meetingId/details" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main className="flex-1 flex flex-col">
                    <MeetingDetails />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            } />
            <Route path="/meeting/:meetingId" element={
              <ProtectedRoute>
                <MeetingRoom />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main className="flex-1 flex flex-col">
                    <Dashboard />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            } />
            <Route
              path="/*"
              element={
                <>
                  <Header />
                  <main className="flex-1 flex flex-col">
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/call-ended" element={<CallEnded />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
