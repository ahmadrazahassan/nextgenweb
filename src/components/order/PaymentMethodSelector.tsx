'use client';

import React, { useState } from 'react';
import { Wallet, Landmark, Phone, Copy, Check, CreditCard, ShieldCheck, Fingerprint, ArrowRight } from 'lucide-react'; // Icons for payment methods
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { useToast } from "@/components/ui/use-toast"; // Import useToast for copy feedback
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentMethod {
  id: string;
  name: string;
  Icon: React.ElementType;
  details: Array<{ label: string; value: string; copyable?: boolean }>;
  themeColor: string; // e.g., 'blue', 'green', 'purple' for theming the card
  gradientFrom: string;
  gradientTo: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'wise',
    name: 'Wise (TransferWise)',
    Icon: Wallet,
    themeColor: 'green',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-500',
    details: [
      { label: 'Email', value: 'minal283636@gmail.com', copyable: true },
      { label: 'Beneficiary Name', value: 'Zaid Umar', copyable: true },
    ],
  },
  {
    id: 'alliedbank',
    name: 'Allied Bank',
    Icon: Landmark,
    themeColor: 'blue',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-500',
    details: [
      { label: 'Account Number', value: '13860010135378610018', copyable: true },
      { label: 'IBAN', value: 'PK57ABPA0010135378610018', copyable: true },
      { label: 'Account Name', value: 'Ahmad Raza Hassan', copyable: true },
    ],
  },
  {
    id: 'nayapay',
    name: 'NayaPay',
    Icon: Phone, // Or a more generic wallet/mobile pay icon if available
    themeColor: 'purple',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-fuchsia-500',
    details: [
      { label: 'NayaPay ID (Email)', value: 'ahmadchz0309@nayapay', copyable: true },
      { label: 'Registered Number', value: '03095782432', copyable: true },
    ],
  },
];

interface PaymentMethodSelectorProps {
  selectedMethodId: string | null;
  onMethodSelect: (methodId: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selectedMethodId, onMethodSelect }) => {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);
  const { toast } = useToast(); // Use toast for copy feedback

  const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedValue(text);
      toast({ 
        title: "Copied!", 
        description: `${label} copied to clipboard.`,
      });
      setTimeout(() => setCopiedValue(null), 2000); 
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({ 
        title: "Copy Failed", 
        description: "Could not copy text to clipboard.", 
        variant: "destructive"
      });
    });
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-2 mr-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
        >
          <CreditCard size={20} />
        </motion.div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Payment Method</h3>
          <p className="text-sm text-gray-500">Select your preferred payment option</p>
        </div>
      </div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {paymentMethods.map((method) => (
          <motion.div
            key={method.id}
            variants={item}
            onMouseEnter={() => setHoveredMethod(method.id)}
            onMouseLeave={() => setHoveredMethod(null)}
            className="h-full"
          >
            <motion.div
            onClick={() => onMethodSelect(method.id)}
              className={`
                relative h-full overflow-hidden p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer
                perspective-1000 bg-white
              ${selectedMethodId === method.id 
                  ? `border-${method.themeColor}-400 shadow-lg` 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}
              `}
              whileHover={{ 
                y: -8,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { type: "spring", stiffness: 300, damping: 15 }
              }}
              animate={{
                rotateX: hoveredMethod === method.id ? 2 : 0,
                rotateY: hoveredMethod === method.id ? -2 : 0,
                boxShadow: selectedMethodId === method.id 
                  ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
              }}
            >
              {/* Background gradient effect */}
              <div 
                className={`absolute inset-0 transition-opacity duration-500 
                  ${(hoveredMethod === method.id || selectedMethodId === method.id) 
                    ? 'opacity-5' 
                    : 'opacity-0'
                  }`}
                style={{
                  background: `linear-gradient(135deg, var(--${method.themeColor}-500), var(--${method.themeColor}-300))`,
                }}
              />
              
              {/* Shimmering effect */}
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <motion.div 
                  className="absolute -inset-[200%] opacity-0 bg-white"
                  initial={false}
                  animate={
                    selectedMethodId === method.id 
                      ? { 
                          left: ["0%", "200%"], 
                          top: ["0%", "200%"],
                          opacity: [0, 0.1, 0.1, 0],
                          rotate: 45
                        } 
                      : {}
                  }
                  transition={
                    selectedMethodId === method.id 
                      ? {
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "loop",
                          ease: "linear",
                          repeatDelay: 5
                        }
                      : {}
                  }
                />
              </div>
              
              {/* Selected indicator */}
              <AnimatePresence>
                {selectedMethodId === method.id && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={`absolute top-4 right-4 w-5 h-5 rounded-full bg-gradient-to-r ${method.gradientFrom} ${method.gradientTo} text-white flex items-center justify-center`}
                  >
                    <Check size={12} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Method header */}
              <div className="flex items-center mb-5 relative">
                <motion.div 
                  className={`flex items-center justify-center p-3 rounded-xl bg-gradient-to-br ${method.gradientFrom} ${method.gradientTo} text-white shadow-lg`}
                  initial={{ rotate: -5 }}
                  animate={{ rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <method.Icon className="h-5 w-5" />
                </motion.div>
                <motion.h4 
                  className="ml-3 text-base font-bold text-gray-800"
                  initial={{ x: -5, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  {method.name}
                </motion.h4>
              </div>
              
              {/* Payment details */}
              <div className="space-y-3 relative">
                {method.details.map((detail, detailIndex) => (
                  <motion.div 
                    key={detail.label} 
                    className="group flex flex-col"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (detailIndex * 0.1) }}
                  >
                    <div className="flex items-center text-xs font-medium text-gray-500 mb-1.5">
                      <Fingerprint className="h-3 w-3 mr-1 text-gray-400" />
                      {detail.label}
            </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm text-gray-700 font-mono bg-gray-50 px-3 py-1.5 rounded-lg flex-grow truncate border border-gray-100 shadow-sm group-hover:border-gray-200 transition-colors">
                      {detail.value}
                      </div>
                    {detail.copyable && (
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleCopy(detail.value, detail.label, e)}
                          className={`
                            p-2 rounded-lg text-gray-400 hover:text-white transition-colors shadow-sm
                            hover:bg-gradient-to-r ${method.gradientFrom} ${method.gradientTo}
                            border border-gray-200 hover:border-transparent
                          `}
                        aria-label={`Copy ${detail.label}`}
                      >
                          {copiedValue === detail.value ? 
                            <Check size={14} className="text-white" /> : 
                            <Copy size={14} />
                          }
                        </motion.button>
                    )}
                  </div>
                  </motion.div>
              ))}
            </div>
              
              {/* Interactive selection button */}
              <motion.div 
                className="mt-5 pt-3 border-t border-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  whileHover={{ 
                    scale: 1.03,
                    backgroundColor: `var(--${method.themeColor}-50)`,
                    borderColor: `var(--${method.themeColor}-200)`,
                  }}
                  whileTap={{ scale: 0.97 }}
                  className={`
                    w-full py-1.5 px-3 rounded-lg border text-sm font-medium 
                    flex items-center justify-center transition-all
                    ${selectedMethodId === method.id 
                      ? `bg-${method.themeColor}-50 text-${method.themeColor}-700 border-${method.themeColor}-200` 
                      : 'bg-white text-gray-600 border-gray-200 hover:text-gray-700'}
                  `}
                  onClick={() => onMethodSelect(method.id)}
                >
                  {selectedMethodId === method.id ? (
                    <>Selected <Check size={14} className="ml-1.5" /></>
                  ) : (
                    <>Choose this method <ArrowRight size={14} className="ml-1.5" /></>
                  )}
                </motion.button>
              </motion.div>
              
              {/* Footer indicator */}
              <motion.div 
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${method.gradientFrom} ${method.gradientTo}`}
                initial={{ width: '0%' }}
                animate={{ 
                  width: selectedMethodId === method.id ? '100%' : 
                         hoveredMethod === method.id ? '70%' : '0%',
                }}
                transition={{ duration: 0.4 }}
              />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex items-center justify-center mt-6 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm"
      >
        <ShieldCheck size={18} className="text-indigo-600 mr-2" />
        <p className="text-sm text-indigo-700 font-medium">All payment information is encrypted and secure</p>
      </motion.div>
    </div>
  );
};

export default PaymentMethodSelector; 