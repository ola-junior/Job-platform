import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isSeeker = auth.user?.role === 'JOB_SEEKER';
  const isEmployer = auth.user?.role === 'EMPLOYER';
  const isAdmin = auth.user?.role === 'ADMIN';

  return { ...auth, handleLogout, isSeeker, isEmployer, isAdmin };
};
