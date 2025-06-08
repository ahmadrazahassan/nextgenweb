'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User as UserIcon, Mail, Lock, Loader2, AlertTriangle, Eye, EyeOff, UserPlus, Shield, CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

interface RegisterFormProps {
  onRegisterSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

type ErrorType = 'emailExists' | 'passwordWeak' | 'passwordMismatch' | 'validation' | 'server' | 'general' | null;

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Field-specific error states
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  
  const { register, login, error: authError, clearError, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Reset form errors when switching to this form
  useEffect(() => {
    clearAllErrors();
  }, []);

  // Clear confirmation error when password changes
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else if (confirmPassword) {
      setConfirmPasswordError(null);
    }
  }, [password, confirmPassword]);

  // Handle auth errors from provider
  useEffect(() => {
    if (authError) {
      setFormError(authError);
      parseErrorType(authError);
    }
  }, [authError]);

  const clearAllErrors = () => {
    setFormError(null);
    setErrorType(null);
    setFullNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    clearError();
  };

  const parseErrorType = (errorMsg: string) => {
    const errorLower = errorMsg.toLowerCase();
    
    if (errorLower.includes('email') && 
        (errorLower.includes('exists') || errorLower.includes('taken') || errorLower.includes('already'))) {
      setErrorType('emailExists');
    } else if (errorLower.includes('password') && errorLower.includes('weak')) {
      setErrorType('passwordWeak');
    } else if (errorLower.includes('server') || errorLower.includes('internal')) {
      setErrorType('server');
    } else {
      setErrorType('general');
    }
  };

  const handleFieldChange = (field: 'fullName' | 'email' | 'password' | 'confirmPassword') => {
    if (formError) setFormError(null);
    if (errorType) setErrorType(null);
    
    switch (field) {
      case 'fullName':
        setFullNameError(null);
        break;
      case 'email':
        setEmailError(null);
        break;
      case 'password':
        setPasswordError(null);
        break;
      case 'confirmPassword':
        setConfirmPasswordError(null);
        break;
    }
  };

  const validateFullName = (name: string): boolean => {
    if (!name.trim()) {
      setFullNameError('Full name is required');
      return false;
    } else if (name.trim().length < 2) {
      setFullNameError('Name must be at least 2 characters');
      return false;
    }
    
    setFullNameError(null);
    return true;
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
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      setPasswordError('Password must include uppercase and lowercase letters');
      return false;
    } else if (!/(?=.*\d)/.test(password)) {
      setPasswordError('Password must include at least one number');
      return false;
    }
    
    setPasswordError(null);
    return true;
  };

  const validateConfirmPassword = (confirmPwd: string): boolean => {
    if (!confirmPwd) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    } else if (confirmPwd !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    
    setConfirmPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    clearAllErrors();
    
    // Validate all fields
    const isNameValid = validateFullName(fullName);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      setErrorType('validation');
      return;
    }

    setIsSubmitting(true);

    try {
      // Register the user
      await register({ fullName, email, password });
      
      // After successful registration, also log them in
      try {
        await login({ email, password });
      } catch (loginErr) {
        console.error("Auto-login after registration failed:", loginErr);
      }
      
      toast({ 
        title: "Registration Successful", 
        description: "Your account has been created and you're now signed in.",
        variant: "default" 
      });
      
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Registration failed. Please try again.';
      setFormError(errorMsg);
      parseErrorType(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    
    // Length check - up to 25 points
    const lengthScore = Math.min(password.length * 3, 25);
    strength += lengthScore;
    
    // Complexity checks - 75 points total
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    // Variety of characters - up to 15 points
    const uniqueChars = new Set(password.split('')).size;
    const varietyScore = Math.min(uniqueChars * 1.5, 15);
    strength += varietyScore;
    
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(password);
  
  // Get password strength color
  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get password strength text
  const getStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'emailExists':
        return <XCircle className="h-4 w-4" />;
      case 'passwordWeak':
        return <Shield className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
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
            <UserPlus size={24} />
          </motion.div>
          <h2 className="text-xl font-bold text-gray-800">Create Account</h2>
          <p className="text-sm text-gray-500 mt-1">Join us today and get started</p>
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Full Name Field */}
          <div className="space-y-1">
            <label 
              htmlFor="fullName" 
              className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
            >
              <UserIcon className="h-4 w-4 mr-2 text-indigo-500" />
              Full Name
            </label>
            <motion.div 
              className={`relative rounded-xl shadow-sm transition-all duration-200 ${
                focusedField === 'fullName' 
                  ? 'ring-2 ring-indigo-300 ring-opacity-50' 
                  : fullNameError ? 'ring-2 ring-red-300 ring-opacity-50' : ''
              }`}
              whileTap={{ scale: 0.995 }}
            >
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); handleFieldChange('fullName'); }}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => {
                  setFocusedField(null);
                  if (fullName) validateFullName(fullName);
                }}
                className={`pl-4 w-full bg-white/90 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl py-5 ${
                  fullNameError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="John Doe"
                disabled={isLoading}
              />
              {fullName && !fullNameError && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.5 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </motion.span>
              )}
            </motion.div>
            {fullNameError && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-600 mt-1 ml-1"
              >
                {fullNameError}
              </motion.p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label 
              htmlFor="email-register" 
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
                id="email-register"
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

          {/* Password Field */}
          <div className="space-y-1">
            <label 
              htmlFor="password-register" 
              className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
            >
              <Lock className="h-4 w-4 mr-2 text-indigo-500" />
              Create Password
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
                id="password-register"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStrengthColor()} transition-all duration-300`} 
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className={passwordStrength <= 25 ? 'text-red-600 font-medium' : 'text-gray-500'}>Weak</span>
                  <span className={passwordStrength > 25 && passwordStrength <= 50 ? 'text-orange-600 font-medium' : 'text-gray-500'}>Fair</span>
                  <span className={passwordStrength > 50 && passwordStrength <= 75 ? 'text-yellow-600 font-medium' : 'text-gray-500'}>Good</span>
                  <span className={passwordStrength > 75 ? 'text-green-600 font-medium' : 'text-gray-500'}>Strong</span>
                </div>
              </div>
            )}
            
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

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
            >
              <Shield className="h-4 w-4 mr-2 text-indigo-500" />
              Confirm Password
            </label>
            <motion.div 
              className={`relative rounded-xl shadow-sm transition-all duration-200 ${
                focusedField === 'confirmPassword' 
                  ? 'ring-2 ring-indigo-300 ring-opacity-50' 
                  : confirmPasswordError ? 'ring-2 ring-red-300 ring-opacity-50' : ''
              }`}
              whileTap={{ scale: 0.995 }}
            >
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); handleFieldChange('confirmPassword'); }}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => {
                  setFocusedField(null);
                  if (confirmPassword) validateConfirmPassword(confirmPassword);
                }}
                className={`pl-4 w-full bg-white/90 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl py-5 ${
                  confirmPasswordError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </motion.div>
            {confirmPasswordError && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-600 mt-1 ml-1"
              >
                {confirmPasswordError}
              </motion.p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-6 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-5 w-5" />
              Create Account
            </>
          )}
        </Button>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-500">
            Already have an account?
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-800 font-medium ml-1"
              onClick={() => {
                if (onSwitchToLogin) {
                  onSwitchToLogin();
                }
              }}
            >
              Sign in
            </button>
          </p>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default RegisterForm; 