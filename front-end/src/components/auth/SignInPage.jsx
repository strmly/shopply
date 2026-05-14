import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthModal } from './AuthModal';
import { getToken } from '../../utils/authState';

const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (getToken()) navigate(from, { replace: true });
  }, [from, navigate]);

  const handleSuccess = () => navigate(from, { replace: true });
  // X closes by going to the destination (or home if destination was /sign-in itself)
  const handleClose = () => navigate(from === '/sign-in' ? '/' : from, { replace: true });

  return <AuthModal isOpen onSuccess={handleSuccess} onClose={handleClose} />;
};

export default SignInPage;
