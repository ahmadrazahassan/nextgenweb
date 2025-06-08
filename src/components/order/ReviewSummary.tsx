'use client';

import React from 'react';
import {
  PackageCheck,
  MapPin,
  CreditCardIcon,
  FileCheck2,
  UserCircle,
  Hash,
  BadgePercent,
  CircleDollarSign,
  CheckCircle2,
  Server,
  Cpu,
  HardDrive,
  Gauge,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Re-use Plan interface if needed, or define specific props
interface PlanDetails {
  name: string;
  cpu: string;
  ram: string;
  storage: string;
  bandwidth: string;
  os: string;
}

interface LocationDetails {
    flag: string;
    name: string;
    city?: string;
}

interface ReviewSummaryProps {
  plan: PlanDetails;
  location: LocationDetails | null;
  userEmail: string | undefined;
  paymentMethodId: string | null;
  paymentProofFilename: string | null;
  promoCode: string | null;
  basePrice: number;
  discount: number;
  totalPrice: number;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  plan,
  location,
  userEmail,
  paymentMethodId,
  paymentProofFilename,
  promoCode,
  basePrice,
  discount,
  totalPrice,
}) => {

  const formatPrice = (price: number) => {
    return price.toFixed(2) + ' PKR';
  }

  const getPaymentMethodName = (id: string | null): string => {
      if (id === 'wise') return 'Wise (TransferWise)';
      if (id === 'alliedbank') return 'Allied Bank';
      if (id === 'nayapay') return 'NayaPay';
      return 'Not Selected';
  }

  const getPaymentMethodColor = (id: string | null): string => {
      if (id === 'wise') return 'bg-green-600';
      if (id === 'alliedbank') return 'bg-blue-600';
      if (id === 'nayapay') return 'bg-purple-600';
      return 'bg-gray-600';
  }

  // Stagger animation for children elements
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Helper component for review items
  const ReviewItem = ({ 
    label, 
    children, 
    icon: Icon, 
    highlight = false,
    iconColor = "text-indigo-500"
  }: {
    label: string, 
    children: React.ReactNode, 
    icon?: React.ElementType,
    highlight?: boolean,
    iconColor?: string
  }) => (
    <motion.div 
      variants={item}
      className={`py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-1 border-b border-gray-100 last:border-0 
        ${highlight ? 'bg-indigo-50/50 rounded-lg px-3 -mx-1' : ''}
      `}
    >
        <dt className="text-sm font-medium text-gray-600 flex items-center">
            {Icon && <Icon size={16} className={`mr-2 ${iconColor}`}/>}
            {label}
        </dt>
        <dd className="mt-1 text-sm font-medium text-gray-800 sm:col-span-2 sm:mt-0 text-left sm:text-right">{children}</dd>
    </motion.div>
  );

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-8"
    >
      {/* Order Status Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl overflow-hidden shadow-lg p-6 text-white relative"
      >
        <div className="absolute top-0 right-0 opacity-10">
          <svg className="w-40 h-40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="white" d="M45.5,-58.1C59.1,-45.1,70.3,-30.5,74.9,-13.9C79.5,2.7,77.5,21.2,68.3,34.6C59.1,48,42.7,56.3,25.8,62.4C8.9,68.5,-8.5,72.3,-25.7,68.8C-42.9,65.2,-59.9,54.3,-69.9,38.3C-79.9,22.4,-82.8,1.4,-76.2,-15.4C-69.6,-32.2,-53.5,-44.7,-37.8,-57.3C-22.1,-69.9,-6.9,-82.6,7.2,-91.4C21.4,-100.2,42.8,-105.2,51.8,-92.7Z" transform="translate(100 100)" />
          </svg>
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Order Review</h3>
            <p className="opacity-90">Please confirm your order details below</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
            <CheckCircle2 size={28} className="text-white" />
          </div>
        </div>
      </motion.div>
      
      {/* Plan Details Card */}
      <motion.div 
        variants={item}
        className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#eef2ff] to-[#f5f3ff] p-4 border-b border-gray-100">
          <h4 className="text-lg font-bold flex items-center text-gray-800">
            <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white mr-3">
              <Server size={18} />
            </div>
            Server Details
          </h4>
        </div>
        <div className="p-5">
          <motion.dl 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-1"
          >
            <ReviewItem label="Plan Name" icon={PackageCheck} highlight={true}>
              <span className="font-semibold text-indigo-700">{plan.name}</span>
            </ReviewItem>
            <ReviewItem label="CPU" icon={Cpu}>
              <div className="flex items-center justify-end">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                {plan.cpu}
              </div>
            </ReviewItem>
            <ReviewItem label="RAM" icon={Server}>
              <div className="flex items-center justify-end">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                {plan.ram}
              </div>
            </ReviewItem>
            <ReviewItem label="Storage" icon={HardDrive}>
              <div className="flex items-center justify-end">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                {plan.storage}
              </div>
            </ReviewItem>
            <ReviewItem label="Bandwidth" icon={Gauge}>
              <div className="flex items-center justify-end">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                {plan.bandwidth}
              </div>
            </ReviewItem>
            <ReviewItem label="Operating System" icon={Globe}>
              <div className="flex items-center justify-end">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                {plan.os}
              </div>
            </ReviewItem>
          </motion.dl>
        </div>
      </motion.div>

      {/* Configuration Card */}
      <motion.div 
        variants={item}
        className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#eff6ff] to-[#eef2ff] p-4 border-b border-gray-100">
          <h4 className="text-lg font-bold flex items-center text-gray-800">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white mr-3">
              <MapPin size={18} />
            </div>
            Configuration
          </h4>
        </div>
        <div className="p-5">
          <motion.dl 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-1"
          >
            <ReviewItem label="Location" icon={MapPin} iconColor="text-blue-500">
              {location ? (
                <div className="flex items-center justify-end space-x-2">
                  <span className="inline-block text-xl">{location.flag}</span> 
                  <span className="font-medium">{location.name} {location.city ? `(${location.city})` : ''}</span>
                </div>
              ) : (
                <span className="text-yellow-600 font-medium flex items-center justify-end">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Not selected
                </span>
              )}
            </ReviewItem>
            <ReviewItem label="Account" icon={UserCircle} iconColor="text-blue-500">
              {userEmail ? (
                <div className="flex items-center justify-end">
                  <div className="bg-gradient-to-r from-indigo-100 to-blue-100 px-3 py-1 rounded-full border border-blue-200">
                    <span className="font-medium">{userEmail}</span>
                  </div>
                </div>
              ) : (
                <span className="text-yellow-600">Not logged in</span>
              )}
            </ReviewItem>
          </motion.dl>
        </div>
      </motion.div>
      
      {/* Payment Details Card */}
      <motion.div 
        variants={item}
        className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#f0fdf4] to-[#ecfdf5] p-4 border-b border-gray-100">
          <h4 className="text-lg font-bold flex items-center text-gray-800">
            <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white mr-3">
              <CreditCardIcon size={18} />
            </div>
            Payment Details
          </h4>
        </div>
        <div className="p-5">
          <motion.dl 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-1"
          >
            <ReviewItem label="Method" icon={CreditCardIcon} iconColor="text-green-500">
              {paymentMethodId ? (
                <div className="flex items-center justify-end">
                  <div className={`text-sm text-white px-3 py-1 rounded-full ${getPaymentMethodColor(paymentMethodId)}`}>
                    {getPaymentMethodName(paymentMethodId)}
                  </div>
                </div>
              ) : (
                <span className="text-yellow-600 font-medium">Not selected</span>
              )}
            </ReviewItem>
            <ReviewItem label="Payment Proof" icon={FileCheck2} iconColor="text-green-500">
              {paymentProofFilename ? (
                <div className="flex items-center justify-end">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full border border-green-200 flex items-center">
                    <CheckCircle2 size={14} className="mr-1" /> 
                    <span className="font-medium">Uploaded</span>
                    <span className="text-xs text-green-600 ml-1.5 max-w-[100px] truncate" title={paymentProofFilename}>
                      ({paymentProofFilename})
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-red-600 font-medium flex items-center justify-end">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Not uploaded
                </span>
              )}
            </ReviewItem>
          </motion.dl>
        </div>
      </motion.div>

      {/* Pricing Summary Card */}
      <motion.div 
        variants={item}
        className="bg-gradient-to-b from-white to-gray-50 border border-gray-100 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#f5f3ff] to-[#eef2ff] p-4 border-b border-gray-100">
          <h4 className="text-lg font-bold flex items-center text-gray-800">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white mr-3">
              <CircleDollarSign size={18} />
            </div>
            Billing Summary
          </h4>
        </div>
        <div className="p-5">
          <motion.dl 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-1"
          >
            <ReviewItem label="Base Price" icon={Hash} iconColor="text-purple-500">
              <div className="font-medium">{formatPrice(basePrice)}</div>
            </ReviewItem>
            {promoCode && discount > 0 && (
              <ReviewItem label={`Promo Code`} icon={BadgePercent} iconColor="text-purple-500">
                <div className="flex items-center justify-end">
                  <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium mr-2">
                    {promoCode}
                  </div>
                  <span className="text-green-600 font-medium">- {formatPrice(discount)}</span>
                </div>
              </ReviewItem>
            )}
            <div className="pt-4 mt-2 border-t border-gray-200">
              <ReviewItem 
                label="Total Amount" 
                icon={CircleDollarSign} 
                highlight={true}
                iconColor="text-purple-500"
              >
                <div className="text-xl font-bold text-indigo-700">
                  {formatPrice(totalPrice)}
                </div>
              </ReviewItem>
            </div>
          </motion.dl>
        </div>
      </motion.div>

      <motion.div 
        variants={item}
        className="flex items-center justify-center bg-[#eef2ff] p-4 rounded-xl border border-indigo-100"
      >
        <ShieldCheck size={18} className="text-indigo-600 mr-2" />
        <p className="text-sm text-indigo-700">Your payment will be manually verified by our team after submission</p>
      </motion.div>
    </motion.div>
  );
};

export default ReviewSummary; 