'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Loader2, AlertTriangle, Eye, EyeOff, LogIn, CheckCircle2, AlertCircle, XCircle, Ban } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

interface LoginFormProps {
  onLoginSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

type ErrorType = 'credentials' | 'notFound' | 'inactive' | 'server' | 'validation' | 'locked' | 'general' | null;

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { login, error: authError, clearError, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Reset form errors when switching to this form
  useEffect(() => {
    clearAllErrors();
  }, []);

  // Clear errors when auth state changes
  useEffect(() => {
    if (authError) {
      setFormError(authError);
      parseErrorType(authError);
    }
  }, [authError]);

  const clearAllErrors = () => {
    setFormError(null);
    setErrorType(null);
    setEmailError(null);
    setPasswordError(null);
    clearError();
  };

  const parseErrorType = (errorMsg: string) => {
    console.log("Parsing error type from:", errorMsg);
    const errorLower = errorMsg.toLowerCase();
    
    if (errorLower.includes('account not found')) {
      setErrorType('notFound');
      console.log("Set error type to notFound");
    } else if (errorLower.includes('incorrect') || errorLower.includes('invalid email or password') || errorLower.includes('credentials')) {
      setErrorType('credentials');
      console.log("Set error type to credentials");
    } else if (errorLower.includes('inactive')) {
      setErrorType('inactive');
    } else if (errorLower.includes('locked')) {
      setErrorType('locked');
    } else if (errorLower.includes('server') || errorLower.includes('internal')) {
      setErrorType('server');
    } else {
      setErrorType('general');
    }
  };

  const handleFieldChange = (field: 'email' | 'password') => {
    if (formError) setFormError(null);
    if (errorType) setErrorType(null);
    
    if (field === 'email') {
      setEmailError(null);
    } else if (field === 'password') {
      setPasswordError(null);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!isValid) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError(null);
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    clearAllErrors();
    
    // Validate form fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      setErrorType('validation');
      return;
    }

    setIsSubmitting(true);
    setLoginAttempts(prev => prev + 1);

    try {
      console.log("Attempting login with:", email);
      await login({ email, password });
      
      toast({ 
        title: "Login Successful", 
        description: "Welcome back! You're now signed in.",
        variant: "default"
      });
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      console.log("Login error caught:", errorMsg);
      
      // Set the form error message
      setFormError(errorMsg);
      
      // Parse the error type for UI treatment
      parseErrorType(errorMsg);
      
      // Show too many attempts message if applicable
      if (loginAttempts >= 3) {
        toast({
          title: "Multiple failed attempts",
          description: "Having trouble logging in? You can reset your password or contact support.",
          variant: "destructive",
          duration: 5000
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const getErrorIcon = () => {
    switch (errorType) {
      case 'credentials':
        return <XCircle className="h-4 w-4" />;
      case 'notFound':
        return <AlertCircle className="h-4 w-4" />;
      case 'inactive':
      case 'locked':
        return <Ban className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Helper function to provide additional guidance based on error type
  const getErrorGuidance = () => {
    console.log("Getting error guidance for type:", errorType);
    
    switch (errorType) {
      case 'credentials':
        return (
          <p className="text-xs mt-1.5 text-gray-600">
            Make sure your email and password are correct. Passwords are case-sensitive.
          </p>
        );
      case 'notFound':
        return (
          <div className="text-xs mt-1.5 text-gray-600">
            <p>
              The email you entered isn't registered in our system. Please check for typos or create a new account.
            </p>
            <p className="mt-1">
              <button 
                type="button" 
                onClick={() => {
                  if (onSwitchToRegister) {
                    onSwitchToRegister();
                  }
                }} 
                className="text-indigo-600 font-medium hover:underline"
              >
                Create an account instead
              </button>
            </p>
          </div>
        );
      case 'locked':
        return (
          <p className="text-xs mt-1.5 text-gray-600">
            Your account has been locked due to too many failed attempts. Please contact support or reset your password.
          </p>
        );
      default:
        return null;
    }
  };

  // Use local isSubmitting state to avoid issues with AuthProvider isLoading state
  const isLoading = isSubmitting;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
    >
      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        onSubmit={handleSubmit} 
        className="space-y-5"
      >
        <div className="mb-2 text-center">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full inline-flex mx-auto mb-3"
          >
            <LogIn size={24} />
          </motion.div>
          <h2 className="text-xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <AnimatePresence>
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Alert variant="destructive" className="bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-sm">
                {getErrorIcon()}
                <AlertDescription className="text-red-700">
                  {formError}
                </AlertDescription>
              </Alert>
              {getErrorGuidance()}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1">
          <label 
            htmlFor="email-login" 
            className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
          >
            <Mail className="h-4 w-4 mr-2 text-indigo-500" />
            Email Address
          </label>
          <motion.div 
            className={`relative rounded-xl shadow-sm transition-all duration-200 ${
              focusedField === 'email' 
                ? 'ring-2 ring-indigo-300 ring-opacity-50' 
                : emailError ? 'ring-2 ring-red-300 ring-opacity-50' : ''
            }`}
            whileTap={{ scale: 0.995 }}
          >
            <Input
              id="email-login"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); handleFieldChange('email'); }}
              onFocus={() => setFocusedField('email')}
              onBlur={() => {
                setFocusedField(null);
                if (email) validateEmail(email);
              }}
              className={`pl-4 w-full bg-white/90 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl py-5 ${
                emailError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder="you@example.com"
              disabled={isLoading}
            />
            {email && !emailError && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.5 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
              >
                <CheckCircle2 className="h-5 w-5" />
              </motion.span>
            )}
          </motion.div>
          {emailError && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-600 mt-1 ml-1"
            >
              {emailError}
            </motion.p>
          )}
        </div>

        <div className="space-y-1">
          <label 
            htmlFor="password-login" 
            className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
          >
            <Lock className="h-4 w-4 mr-2 text-indigo-500" />
            Password
          </label>
          <motion.div 
            className={`relative rounded-xl shadow-sm transition-all duration-200 ${
              focusedField === 'password' 
                ? 'ring-2 ring-indigo-300 ring-opacity-50' 
                : passwordError ? 'ring-2 ring-red-300 ring-opacity-50' : ''
            }`}
            whileTap={{ scale: 0.995 }}
          >
            <Input
              id="password-login"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); handleFieldChange('password'); }}
              onFocus={() => setFocusedField('password')}
              onBlur={() => {
                setFocusedField(null);
                if (password) validatePassword(password);
              }}
              className={`pl-4 w-full bg-white/90 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl py-5 ${
                passwordError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </motion.div>
          {passwordError && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-600 mt-1 ml-1"
            >
              {passwordError}
            </motion.p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-6 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
            </>
          )}
        </Button>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-500">
            Don't have an account yet?
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-800 font-medium ml-1"
              onClick={() => {
                if (onSwitchToRegister) {
                  onSwitchToRegister();
                }
              }}
            >
              Create an account
            </button>
          </p>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default LoginForm; 