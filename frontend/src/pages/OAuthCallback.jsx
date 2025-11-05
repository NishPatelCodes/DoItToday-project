import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    if (error) {
      // Handle error - redirect to login with error message
      console.error('OAuth error:', error);
      navigate('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (token && name && email && userId) {
      // Successful OAuth login
      const user = {
        id: userId,
        name: decodeURIComponent(name),
        email: decodeURIComponent(email),
        streak: parseInt(searchParams.get('streak') || '0'),
        xp: parseInt(searchParams.get('xp') || '0'),
        level: parseInt(searchParams.get('level') || '1'),
        totalTasksCompleted: parseInt(searchParams.get('totalTasksCompleted') || '0'),
      };
      
      login(user, token);
      navigate('/dashboard');
    } else {
      // Missing parameters - redirect to login
      navigate('/login?error=' + encodeURIComponent('Authentication failed. Please try again.'));
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent-primary)] border-t-transparent mb-4"></div>
        <p className="text-[var(--text-secondary)]">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;

