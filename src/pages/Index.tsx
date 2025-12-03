import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '@/lib/api';
import Dashboard from './Dashboard';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // If authenticated, render the dashboard
  if (isAuthenticated()) {
    return <Dashboard />;
  }

  // Render nothing while redirecting
  return null;
}
