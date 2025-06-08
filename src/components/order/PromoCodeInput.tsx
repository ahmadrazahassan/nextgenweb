'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Tag, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromoCodeInputProps {
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  onApplyPromoCode: () => void;
  isLoading?: boolean;
  appliedMessage?: string | null;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  promoCode,
  onPromoCodeChange,
  onApplyPromoCode,
  isLoading = false,
  appliedMessage = null,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isSuccess = appliedMessage && !appliedMessage.includes('Error') && !appliedMessage.includes('Invalid');
  const isError = appliedMessage && (appliedMessage.includes('Error') || appliedMessage.includes('Invalid'));

  return (
    <div className="mb-8">
      <div className="flex items-center mb-3">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-2 mr-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white"
        >
          <Tag size={18} />
        </motion.div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Promo Code</h3>
          <p className="text-sm text-gray-500">Apply a discount code if you have one</p>
        </div>
      </div>

      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={`
          p-5 rounded-xl border transition-all duration-300 shadow-sm
          ${isSuccess ? 'bg-green-50 border-green-200' : 
            isError ? 'bg-red-50 border-red-200' :
            isFocused ? 'bg-white border-indigo-300 shadow-md' : 
            'bg-white/80 backdrop-blur-sm border-gray-200'}
        `}
      >
        <div className="flex items-stretch gap-3">
          <div className={`
            relative flex-grow rounded-lg overflow-hidden transition-all duration-300
            ${isFocused ? 'ring-2 ring-indigo-300 ring-opacity-50' : ''}
          `}>
          <Input
            id="promo-code"
            type="text"
              placeholder="Enter discount code"
            value={promoCode}
            onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="pl-4 pr-3 py-6 h-12 border-gray-200 bg-white focus:border-indigo-300 focus:ring-0 disabled:opacity-60 rounded-xl font-medium text-gray-700 placeholder:text-gray-400"
              disabled={isLoading || !!isSuccess}
            />
            {promoCode && (
              <button 
                type="button"
                onClick={() => onPromoCodeChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                disabled={isLoading || !!isSuccess}
              >
                <span className="sr-only">Clear</span>
                <span className="text-lg" aria-hidden="true">&times;</span>
              </button>
            )}
        </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
              type="button"
          onClick={onApplyPromoCode}
              disabled={isLoading || !promoCode || !!isSuccess}
              className={`
                px-5 py-2.5 h-12 font-medium disabled:opacity-50 disabled:cursor-not-allowed 
                flex items-center justify-center shrink-0 rounded-xl shadow-md
                ${isSuccess 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'}
              `}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
              ) : isSuccess ? (
                <CheckCircle className="h-5 w-5" />
          ) : (
                'Apply Code'
          )}
        </Button>
          </motion.div>
      </div>

        <AnimatePresence>
      {appliedMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 flex items-center"
            >
              {isSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <p className="text-sm text-green-700 font-medium">{appliedMessage}</p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                  <p className="text-sm text-red-700 font-medium">{appliedMessage}</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add animated badge for example promo codes */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-3 flex flex-wrap gap-2"
      >
        <span className="text-xs text-gray-500">Example codes:</span>
        {["WELCOME10", "SUMMER25", "SPECIAL15"].map((code, index) => (
          <motion.button
            key={code}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => !isLoading && !isSuccess && onPromoCodeChange(code)}
            disabled={isLoading || !!isSuccess}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-all"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + (index * 0.1) }}
          >
            {code}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default PromoCodeInput; 