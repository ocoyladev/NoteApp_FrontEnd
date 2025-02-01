import { useState } from 'react';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { LoginModal } from './components/LoginModal';
import { API_URL } from './configuration/config';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
  
      const data = await response.json();
      console.log('Login successful:', data);
  
      setIsAuthenticated(true);
      setShowLoginModal(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Login failed:', error.message);
        alert('Login failed. Please check your credentials.');
      } else {
        console.error('Login failed:', error);
        alert('Login failed. An unexpected error occurred.');
      }
    }
  };


  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <>
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Home onLogin={() => setShowLoginModal(true)} />
      )}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </>
  );
}

export default App