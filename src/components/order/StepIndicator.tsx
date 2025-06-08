'use client';

import React from 'react';
import { CheckCircle, CircleDot, Circle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StepConfig {
  id: string;
  name: string;
}

interface StepIndicatorProps {
  steps: StepConfig[];
  currentStepId: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStepId }) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.nav 
      aria-label="Progress" 
      className="mb-10 md:mb-16"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <ol role="list" className="flex items-center justify-between space-x-2 md:space-x-4 mx-auto max-w-4xl">
        {steps.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentStepIndex;
          const isCurrent = stepIdx === currentStepIndex;
          const isUpcoming = stepIdx > currentStepIndex;

          return (
            <motion.li 
              key={step.id} 
              className="relative flex-1"
              variants={itemVariants}
            >
              <div className="flex flex-col items-center">
                {/* Step connection line */}
                {stepIdx < steps.length - 1 && (
                  <div className="absolute top-6 left-full w-full max-w-full transform -translate-x-1/2 flex items-center justify-center z-[-1]">
                    <div className="h-0.5 w-full bg-gray-200 relative overflow-hidden">
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isCompleted ? 1 : 0 }}
                        transition={{ 
                          duration: 0.8, 
                          ease: "easeInOut",
                          delay: isCompleted ? 0.3 : 0
                        }}
                        style={{ transformOrigin: 'left' }}
                      />
                    </div>
                    {isCompleted && (
                      <motion.div 
                        className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 text-indigo-600"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Step Icon/Number */}
                <motion.div
                  className={`
                    flex h-12 w-12 items-center justify-center rounded-full 
                    transition-all duration-300 ease-in-out relative
                    ${isCompleted 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30' 
                      : isCurrent 
                        ? 'bg-white border-2 border-indigo-600 shadow-lg shadow-indigo-500/20' 
                        : 'bg-white border-2 border-gray-200'}
                  `}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: isCurrent ? 1.1 : 1, 
                    opacity: 1,
                    boxShadow: isCurrent ? '0 10px 25px -5px rgba(79, 70, 229, 0.4)' : 
                               isCompleted ? '0 8px 16px -4px rgba(79, 70, 229, 0.3)' : 
                               '0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  }}
                  transition={{ 
                    duration: 0.4, 
                    type: "spring", 
                    stiffness: 200,
                    delay: stepIdx * 0.1
                  }}
                  whileHover={{ 
                    scale: isUpcoming ? 1.05 : isCurrent ? 1.15 : 1.05,
                    boxShadow: isUpcoming ? "0px 8px 15px rgba(0, 0, 0, 0.1)" : ""
                  }}
                >
                  <AnimatePresence mode="wait">
                    {isCompleted && (
                      <motion.div
                        key="completed"
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle className="h-6 w-6 text-white" />
                      </motion.div>
                    )}
                    
                    {isCurrent && (
                      <motion.div
                        key="current"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CircleDot className="h-6 w-6 text-indigo-600" />
                      </motion.div>
                    )}
                    
                    {isUpcoming && (
                      <motion.div
                        key="upcoming"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="text-sm font-medium text-gray-500">{stepIdx + 1}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Pulse effect for current step */}
                  {isCurrent && (
                    <motion.div 
                      className="absolute inset-0 rounded-full border-2 border-indigo-500"
                      initial={{ opacity: 0.7, scale: 1 }}
                      animate={{ 
                        opacity: 0,
                        scale: 1.2,
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeOut"
                      }}
                    />
                  )}
                </motion.div>

                {/* Step Label */}
                <motion.div
                  className="mt-3 flex flex-col items-center"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + (stepIdx * 0.1) }}
                >
                  <span className={`
                    text-sm font-medium
                    ${isCompleted 
                      ? 'text-indigo-600' 
                      : isCurrent 
                        ? 'text-indigo-700 font-semibold' 
                        : 'text-gray-500'}
                  `}>
                  {step.name}
                </span>
                  
                  {/* Active indicator dot */}
                  {isCurrent && (
                    <motion.div 
                      className="h-1.5 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mt-1.5"
                      layoutId="activeStepIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </motion.nav>
  );
};

export default StepIndicator; 