import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('student_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('student_token') || null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Validate session on app launch
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('student_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('student_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session expired or invalid, logging out:', err.message);
          logout(false);
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      setUser(data);
      setToken(data.token);
      localStorage.setItem('student_token', data.token);
      localStorage.setItem('student_user', JSON.stringify(data));
      addToast(`Welcome back, ${data.name}!`, 'success');
      return data;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const data = res.data;
      setUser(data);
      setToken(data.token);
      localStorage.setItem('student_token', data.token);
      localStorage.setItem('student_user', JSON.stringify(data));
      addToast('Student account created successfully in MongoDB!', 'success');
      return data;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const logout = (showToast = true) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    if (showToast) {
      addToast('Signed out of Student Mart', 'info');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/user/profile', profileData);
      const updated = { ...user, ...res.data };
      setUser(updated);
      localStorage.setItem('student_user', JSON.stringify(updated));
      addToast('Profile changes saved to MongoDB database!', 'success');
      return updated;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.put('/user/change-password', {
        currentPassword,
        newPassword,
      });
      addToast('Password updated successfully in database!', 'success');
      return res.data;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
