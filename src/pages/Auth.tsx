
import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

type AuthView = 'login' | 'signup' | 'forgotPassword';

const Auth = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-8 px-4 md:px-6">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1E293B]">Découpe PDF</h1>
          <p className="text-sm text-gray-600">
            par YC pour Inetum Software (01/2025)
          </p>
        </div>

        {currentView === 'login' && (
          <LoginForm 
            onForgotPassword={() => setCurrentView('forgotPassword')} 
            onSignup={() => setCurrentView('signup')} 
          />
        )}

        {currentView === 'signup' && (
          <SignupForm onLogin={() => setCurrentView('login')} />
        )}

        {currentView === 'forgotPassword' && (
          <ForgotPasswordForm onLogin={() => setCurrentView('login')} />
        )}
      </div>
    </div>
  );
};

export default Auth;
