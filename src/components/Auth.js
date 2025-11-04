import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import './Auth.css';

const Auth = ({ user, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  if (user) {
    return (
      <motion.div
        className="auth-panel glass-minimal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <button className="auth-close" onClick={onClose}>✕</button>
        <div className="auth-content">
          <div className="auth-user-info">
            <div className="user-avatar">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <p className="user-email refined-text">{user.email}</p>
          </div>
          <button 
            className="auth-signout-btn elongated"
            onClick={handleSignOut}
          >
            SIGN OUT
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="auth-panel glass-minimal"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <button className="auth-close" onClick={onClose}>✕</button>
      
      <div className="auth-content">
        <h3 className="auth-title elongated">
          {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
        </h3>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input refined-text"
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              className="auth-input refined-text"
            />
          </div>

          {error && (
            <motion.div
              className="auth-error refined-text"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            className="auth-submit elongated"
            disabled={loading}
          >
            {loading ? 'PROCESSING...' : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT')}
          </button>
        </form>

        <button
          className="auth-toggle refined-text"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
        >
          {isLogin ? 'Need an account? Create one' : 'Already have an account? Sign in'}
        </button>
      </div>
    </motion.div>
  );
};

export default Auth;
