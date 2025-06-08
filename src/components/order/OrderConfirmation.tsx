'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Calendar, 
  Server, 
  ArrowRight, 
  Sparkles, 
  BarChart4, 
  Clock3,
  Mail,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface OrderConfirmationProps {
  orderId: string;
  planName: string;
  totalPrice: number;
  customerEmail: string;
  orderDate: string;
  estimatedDeployTime?: string;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  orderId,
  planName,
  totalPrice,
  customerEmail,
  orderDate,
  estimatedDeployTime = '2-4 hours'
}) => {
  const [isCopied, setIsCopied] = useState(false);
  
  // Format price with PKR
  const formattedPrice = totalPrice.toFixed(2) + ' PKR';
  
  // Create short order ID for display
  const shortOrderId = orderId.slice(0, 8) + '...' + orderId.slice(-4);
  
  // Trigger confetti effect on component mount
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Since they're launched randomly, these won't be in sync anymore
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#4F46E5', '#7C3AED', '#10B981'],
      });
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#4F46E5', '#7C3AED', '#10B981'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative mb-12"
      >
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-12 w-64 h-64 bg-white opacity-10 rounded-full"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-full">
            <CheckCircle2 size={48} className="text-white" />
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Order Confirmed!</h1>
            <p className="text-indigo-100 text-lg max-w-2xl">
              Thank you for your order. Your server will be deployed and ready for use shortly.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-12 gap-8"
      >
        {/* Main Order Info */}
        <motion.div 
          variants={item}
          className="col-span-1 md:col-span-7 bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="p-6 md:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                <Package className="w-5 h-5 mr-2 text-indigo-600" />
                Order Details
              </h2>
              
              <div className="flex items-center mt-4 bg-indigo-50 p-4 rounded-xl">
                <div className="mr-4">
                  <p className="text-sm text-gray-500">Order ID</p>
                  <div className="flex items-center">
                    <p className="font-mono font-medium text-indigo-700">{shortOrderId}</p>
                    <button 
                      onClick={copyOrderId}
                      className="ml-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      {isCopied ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="border-l border-indigo-200 pl-4 ml-4">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{orderDate}</p>
                </div>
              </div>
            </div>
            
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Server className="w-5 h-5 mr-2 text-indigo-600" /> 
                Service Details
              </h3>
              
              <div className="bg-gradient-to-r from-gray-50 to-white border border-indigo-100 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-indigo-100 mr-3">
                      <Server size={20} className="text-indigo-600" />
                    </div>
                    <span className="font-medium text-gray-900">{planName}</span>
                  </div>
                  <span className="font-bold text-indigo-700">{formattedPrice}</span>
                </div>
                <div className="p-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-green-100 mr-3">
                      <Truck size={18} className="text-green-600" />
                    </div>
                    <span className="text-gray-800">Estimated Deployment</span>
                  </div>
                  <div className="flex items-center text-green-700 font-medium">
                    <Clock3 size={16} className="mr-1" />
                    {estimatedDeployTime}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-indigo-600" />
                Receipt Information
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-gray-700">A detailed receipt has been sent to:</p>
                <p className="font-medium text-indigo-700 mt-1">{customerEmail}</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Next Steps */}
        <motion.div 
          variants={item}
          className="col-span-1 md:col-span-5 space-y-6"
        >
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
              What's Next?
            </h2>
            
            <div className="space-y-5">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-800 font-bold">1</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-900">Deployment Processing</h3>
                  <p className="mt-1 text-sm text-gray-500">Our team is now setting up your server. You'll receive an email confirmation when it's ready.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-800 font-bold">2</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-900">Access Your Dashboard</h3>
                  <p className="mt-1 text-sm text-gray-500">Once deployed, you can manage your server from your account dashboard.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-800 font-bold">3</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-900">Get Support</h3>
                  <p className="mt-1 text-sm text-gray-500">Our technical support team is available 24/7 to help with any questions.</p>
                </div>
              </div>
            </div>
          </div>
          
          <motion.div 
            variants={item}
            className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-6 border border-indigo-100 shadow-lg"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <BarChart4 className="w-5 h-5 mr-2 text-indigo-600" />
              Track Your Order
            </h3>
            
            <p className="text-gray-600 mb-4">Follow the progress of your server setup and get real-time updates.</p>
            
            <div className="space-y-3">
              <Link href="/dashboard/orders" className="block">
                <Button className="w-full bg-white hover:bg-gray-50 text-indigo-700 border border-indigo-200 hover:border-indigo-400 transition-all duration-200 rounded-xl py-6 font-medium shadow-sm hover:shadow flex justify-between items-center">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              
              <Link href="/support" className="block">
                <Button variant="outline" className="w-full bg-white/50 hover:bg-white text-gray-700 hover:text-indigo-700 border border-gray-200 hover:border-indigo-300 transition-all duration-200 rounded-xl py-6 font-medium">
                  <span>Need Help?</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        variants={item}
        className="mt-12 text-center text-gray-500 text-sm"
      >
        <p>Thank you for choosing our services. For any questions, please <Link href="/contact" className="text-indigo-600 hover:text-indigo-800 hover:underline">contact our support team</Link>.</p>
      </motion.div>
    </motion.div>
  );
};

export default OrderConfirmation; 