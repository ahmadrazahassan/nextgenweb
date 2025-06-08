'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle, CheckCircle, Loader2, Shield, BadgeCheck, Mail } from 'lucide-react';
import { motion } from "framer-motion";

const UserDisplay: React.FC = () => {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  if (!user) {
    return null; // Or a fallback if this component is rendered when no user (should not happen in intended flow)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    // AuthProvider will clear user, OrderPage will re-render based on isAuthenticated
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user.fullName) return user.email.substring(0, 2).toUpperCase();
    return user.fullName.split(' ').map(name => name[0]).join('').toUpperCase();
  };

  // Get random gradient colors
  const getGradient = () => {
    const gradients = [
      'from-indigo-600 to-purple-600',
      'from-blue-600 to-indigo-600',
      'from-violet-600 to-fuchsia-600',
      'from-sky-500 to-indigo-600',
      'from-blue-500 to-teal-500',
    ];
    
    // Use a hash of the user's email to select a consistent gradient
    const hash = user.email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl overflow-hidden shadow-lg bg-white/80 backdrop-blur-sm border border-white/20"
    >
      <div className={`bg-gradient-to-r ${getGradient()} px-6 py-6 text-white relative overflow-hidden`}>
        <motion.div 
          className="absolute inset-0 bg-white opacity-0"
          animate={{ opacity: isHovering ? 0.1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold shadow-inner"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {getInitials()}
            </motion.div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-indigo-100">Welcome back</p>
                <BadgeCheck className="h-4 w-4 text-indigo-200" />
              </div>
              <motion.p 
                className="text-xl font-bold text-white truncate" 
                title={user.email}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {user.fullName || user.email}
              </motion.p>
              <div className="flex items-center gap-1.5 mt-1">
                <Mail className="h-3.5 w-3.5 text-indigo-200" />
                <p className="text-sm text-indigo-200 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white px-6 py-5 space-y-4">
        <motion.div 
          className="flex items-center p-3 bg-green-50 rounded-xl text-green-700 space-x-2 border border-green-200"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm font-medium">Account verified and ready to proceed</p>
        </motion.div>
        
        <div className="pt-2 pb-1">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isAuthLoading || isLoggingOut}
              className="w-full py-5 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-50 border-gray-200 hover:text-indigo-600 hover:border-indigo-300 transition-all duration-200 disabled:opacity-60"
            >
              {isLoggingOut ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><LogOut className="h-4 w-4" /> Sign Out</>
              )}
            </Button>
          </motion.div>
        </div>
        
        <motion.div 
          className="flex items-center justify-center pt-3 border-t border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={`p-2 rounded-full bg-gradient-to-r ${getGradient()} bg-opacity-10`}>
            <Shield className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="ml-2 text-xs text-gray-500">
            Your personal information is secure with us
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserDisplay; 