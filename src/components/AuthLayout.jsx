import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import AnimatedSVGHero from './AnimatedSVGHero';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const AuthLayout = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div id="tsparticles-auth" className="auth-layout-container">
      <AnimatedSVGHero />
      <div className="auth-split-wrapper">
        <div className={`auth-panel ${isLogin ? 'active' : ''}`}>
          <LoginForm onToggle={toggleMode} />
        </div>
        <div className={`auth-panel ${!isLogin ? 'active' : ''}`}>
          <SignupForm onToggle={toggleMode} />
        </div>
        <div className="toggle-slider" style={{ left: isLogin ? '0%' : '50%' }} />
      </div>
    </div>
  );
};

export default AuthLayout;

