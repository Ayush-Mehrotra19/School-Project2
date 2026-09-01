'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import './auth.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session || localStorage.getItem('growmyiq_user')) {
          router.push('/dashboard');
        }
      } catch (e) {
        if (localStorage.getItem('growmyiq_user')) {
          router.push('/dashboard');
        }
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear message when user starts typing
    if (message) {
      setMessage('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isLogin) {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const isPlaceholderSupabase =
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder.supabase.co');

      if (isPlaceholderSupabase) {
        const demoUser = {
          email: formData.email,
          name: formData.username || formData.email.split('@')[0],
          handle: `@${(formData.username || formData.email.split('@')[0]).toLowerCase().replace(/[^a-z0-9_]/g, '')}`
        };
        localStorage.setItem('growmyiq_user', JSON.stringify(demoUser));

        setMessage('Successfully signed in! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 600);
        return;
      }

      if (isLogin) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
          options: formData.rememberMe
            ? {
                expiresIn: '4w'
              }
            : {}
        });

        if (error) {
          throw error;
        }

        setMessage('Successfully signed in! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
              display_name: formData.username
            }
          }
        });

        if (error) {
          throw error;
        }

        setMessage('Account created! You can now sign in.');
        setIsLogin(true);
        setFormData({
          username: '',
          email: '',
          password: '',
          rememberMe: false
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);

      if (error.name === 'AuthRetryableFetchError' || error.message?.includes('Failed to fetch')) {
        const demoUser = {
          email: formData.email,
          name: formData.username || formData.email.split('@')[0],
          handle: `@${(formData.username || formData.email.split('@')[0]).toLowerCase().replace(/[^a-z0-9_]/g, '')}`
        };
        localStorage.setItem('growmyiq_user', JSON.stringify(demoUser));
        setMessage('Signed in (Demo Mode)! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 600);
        return;
      }

      if (error.message?.includes('Invalid login credentials')) {
        setMessage('Invalid email or password. Please try again.');
      } else if (error.message?.includes('User already registered')) {
        setMessage('An account with this email already exists. Please sign in.');
      } else if (error.message?.includes('Email rate limit exceeded')) {
        setMessage('Too many sign up attempts. Please try again later.');
      } else {
        setMessage(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      username: '',
      email: '',
      password: '',
      rememberMe: false
    });
  };

  return (
    <div className="auth-container dark">
      <div className="auth-bg-decoration"></div>

      <div className="auth-content">
        <Link href="/" className="auth-back-link">
          ← Back to Home
        </Link>

        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="auth-subtitle">
              {isLogin
                ? 'Sign in to your account to continue'
                : 'Sign up to get started with your journey'
              }
            </p>
          </div>

          {message && (
            <div className={`auth-message ${message.includes('Successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  placeholder="Enter your username"
                  autoComplete="username"
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                autoComplete={isLogin ? 'email' : 'email'}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {isLogin && (
              <div className="form-checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">Remember me</span>
                </label>
                <Link href="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="auth-submit-btn"
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="auth-toggle">
            <span className="toggle-text">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="toggle-btn"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}