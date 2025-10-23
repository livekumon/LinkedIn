import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Ideas from './pages/Ideas';
import RecycleBin from './pages/RecycleBin';
import Subscriptions from './pages/Subscriptions';
import LinkedInConnections from './pages/LinkedInConnections';
import CreditHistory from './pages/CreditHistory';
import TagSets from './pages/TagSets';
import ScheduledPosts from './pages/ScheduledPosts';
import CalendarView from './pages/CalendarView';
import Referrals from './pages/Referrals';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Marketing Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ideas"
                element={
                  <ProtectedRoute>
                    <Ideas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Ideas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/credit-history"
                element={
                  <ProtectedRoute>
                    <CreditHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tagsets"
                element={
                  <ProtectedRoute>
                    <TagSets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recycle-bin"
                element={
                  <ProtectedRoute>
                    <RecycleBin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscriptions"
                element={
                  <ProtectedRoute>
                    <Subscriptions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/linkedin-connections"
                element={
                  <ProtectedRoute>
                    <LinkedInConnections />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scheduled-posts"
                element={
                  <ProtectedRoute>
                    <ScheduledPosts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <CalendarView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/referrals"
                element={
                  <ProtectedRoute>
                    <Referrals />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App;
