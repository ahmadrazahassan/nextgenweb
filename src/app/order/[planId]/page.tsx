'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, ArrowRight, Info, UserCheck, UserPlus, CreditCard, ShieldCheck, CheckCircle, MapPin, Server, AlertTriangle } from 'lucide-react'; // Example icons
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Providers & Hooks
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from "@/components/ui/use-toast"; // Use standard shadcn hook

// Components
import LocationSelector, { locations as serverLocations } from '@/components/order/LocationSelector';
import PromoCodeInput from '@/components/order/PromoCodeInput';
import StepIndicator from '@/components/order/StepIndicator';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import UserDisplay from '@/components/auth/UserDisplay';
import PaymentMethodSelector from '@/components/order/PaymentMethodSelector';
import PaymentProofUpload from '@/components/order/PaymentProofUpload';
import ReviewSummary from '@/components/order/ReviewSummary'; // Import ReviewSummary
import HowToOrderGuide from '@/components/order/HowToOrderGuide'; // Import the static guide

// Define the Plan interface based on your plans.js structure
interface Plan {
  id: string;
  name: string;
  cpu: string;
  ram: string;
  storage: string;
  price: number;
  bandwidth: string;
  os: string;
  useCases: string[];
  orderLink: string;
  themeColor: string;
  label: string | null;
  // Add any other fields from your plans.js if necessary
}

// Define types for order steps if you want strong typing for steps
type OrderStepId = 'configure' | 'account' | 'payment' | 'review';

interface StepConfig {
  id: OrderStepId;
  name: string;
}

const orderSteps: StepConfig[] = [
  { id: 'configure', name: 'Configuration' },
  { id: 'account', name: 'Account Details' },
  { id: 'payment', name: 'Payment Method' },
  { id: 'review', name: 'Review & Confirm' },
];

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast(); // Use toast for notifications
  const planId = params?.planId as string;

  const { user, isAuthenticated, isLoading: isAuthLoading, error: authError, clearError } = useAuth();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [planError, setPlanError] = useState<string | null>(null);
  
  const [currentStep, setCurrentStep] = useState<OrderStepId>(orderSteps[0].id);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(serverLocations.length > 0 ? serverLocations[0].id : null);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeMessage, setPromoCodeMessage] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);

  const [authFormMode, setAuthFormMode] = useState<'login' | 'register'>('login');

  // Payment Step State
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [paymentProofFilename, setPaymentProofFilename] = useState<string | null>(null);
  const [paymentStepError, setPaymentStepError] = useState<string | null>(null);

  // Submission State
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSubmissionError, setOrderSubmissionError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Check when auth state changes to handle login/register success
  useEffect(() => {
    if (isAuthenticated && user && currentStep === 'account') {
      // Show success toast when user is successfully authenticated
      toast({
        title: "Authentication Successful",
        description: `Welcome${user.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}!`,
        duration: 3000
      });
    }
  }, [isAuthenticated, user, currentStep, toast]);

  useEffect(() => {
    if (planId) {
      const fetchPlanDetails = async () => {
        setIsLoadingPlan(true);
        setPlanError(null);
        try {
          const response = await fetch(`/api/plans/${planId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch plan: ${response.statusText}`);
          }
          const data: Plan = await response.json();
          setPlan(data);
        } catch (err: any) {
          setPlanError(err.message || 'An unexpected error occurred.');
        }
        setIsLoadingPlan(false);
      };
      fetchPlanDetails();
    }
  }, [planId]);

  const handleLocationChange = (locationId: string) => {
    setSelectedLocation(locationId);
  };

  const handlePromoCodeChange = (code: string) => {
    setPromoCode(code);
    if (promoCodeMessage) setPromoCodeMessage(null); // Clear message on new input
    if (promoDiscount > 0) setPromoDiscount(0); // Clear discount if code changes
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setIsApplyingPromo(true);
    setPromoCodeMessage(null);
    
    try {
      // Call the promo code validation API directly
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: promoCode, planId: plan?.id }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to validate promo code');
      }
      
      if (result.valid) {
        setPromoCodeMessage(result.message);
        // Calculate the discount amount directly
        const discountAmount = plan ? Math.round((plan.price * result.discount) / 100) : 0;
        setPromoDiscount(discountAmount);
      } else {
        setPromoCodeMessage(result.message || 'Invalid or expired promo code.');
        setPromoDiscount(0);
      }
    } catch (error: any) {
      console.error('Error validating promo code:', error);
      setPromoCodeMessage(`Error: ${error.message || 'Failed to validate promo code'}`);
      setPromoDiscount(0);
    } finally {
      setIsApplyingPromo(false);
    }
  };
  
  const currentStepIndex = orderSteps.findIndex(s => s.id === currentStep);

  const goToNextStep = () => {
    let canProceed = true;
    // Add validation checks for the current step before proceeding
    if (currentStep === 'payment') {
        if (!isAuthenticated) {
            setPaymentStepError("Please log in or register first.");
            setCurrentStep('account'); 
            canProceed = false;
        }
        else if (!selectedPaymentMethodId) {
            setPaymentStepError("Please select a payment method.");
            canProceed = false;
        }
        else if (!paymentProofUrl) {
            setPaymentStepError("Please upload your payment proof.");
            canProceed = false;
        }
        if (canProceed) setPaymentStepError(null);
    }
    
    if (canProceed && currentStepIndex < orderSteps.length - 1) {
      setCurrentStep(orderSteps[currentStepIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(orderSteps[currentStepIndex - 1].id);
    }
  };

  const calculatedTotal = plan ? plan.price - promoDiscount : 0;

  // Render loading/error/not found states
  if (!params || !planId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }
  if (isLoadingPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-700 p-8">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mb-4" />
        <p className="text-xl font-medium">Loading plan details...</p>
      </div>
    );
  }
  if (planError) { 
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-700 p-8">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <p className="text-xl font-semibold">Error Loading Plan</p>
        <p className="text-center mt-1">{planError}</p>
        <Button variant="outline" className="mt-6" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }
  if (!plan) { 
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 text-yellow-700 p-8">
        <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
        <p className="text-xl font-semibold">Plan Not Found</p>
        <p className="text-center mt-1">The plan ID specified does not exist.</p>
         <Button variant="outline" className="mt-6" onClick={() => router.push('/pricing')}>View Plans</Button>
      </div>
    );
  }

  const selectedLocationDetails = serverLocations.find(loc => loc.id === selectedLocation);

  // Function to handle successful login/registration for the order page
  const handleAuthSuccess = () => {
    // If user logs in/registers successfully on the account page, move them to payment
    if (currentStep === 'account') {
      // Clear any previous errors
      clearError();
      
      // Show success message
      toast({
        title: "Authentication Successful",
        description: `Welcome${user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}! Proceeding to payment information...`,
        duration: 3000
      });
      
      // Proceed to next step
      goToNextStep();
    }
  }

  // Payment Step Handlers
  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethodId(methodId);
    setPaymentStepError(null); // Clear error when method changes
  };

  const handleProofUploadSuccess = (url: string, name: string) => {
    setPaymentProofUrl(url);
    setPaymentProofFilename(name);
    setPaymentStepError(null); // Clear error on successful upload
  };

  const handleProofUploadError = (errorMessage: string) => {
    setPaymentStepError(`Upload Error: ${errorMessage}`);
    setPaymentProofUrl(null); // Clear proof URL on error
    setPaymentProofFilename(null);
  };

  // Order Submission Handler
  const handlePlaceOrder = async () => {
      if (!isAuthenticated || !user || !plan || !selectedLocation || !selectedPaymentMethodId || !paymentProofUrl) {
          setOrderSubmissionError("Missing required information to place order. Please review all steps.");
          // Attempt to navigate back to the first step with missing info (optional)
          if (!isAuthenticated || !user) setCurrentStep('account');
          else if (!selectedPaymentMethodId || !paymentProofUrl) setCurrentStep('payment');
          else if (!selectedLocation) setCurrentStep('configure');
          return;
      }

      setIsSubmittingOrder(true);
      setOrderSubmissionError(null);
      setIsRedirecting(false);

      const orderData = {
          planId: plan.id,
          planName: plan.name,
          location: selectedLocation, // Assuming location ID is sufficient
          paymentMethod: selectedPaymentMethodId,
          paymentProofUrl: paymentProofUrl,
          subtotal: plan.price,
          total: calculatedTotal,
          // Add quantity, duration if implemented
      };

      try {
          const response = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderData)
          });

          const result = await response.json();

          if (!response.ok) {
              throw new Error(result.error || 'Failed to place order.');
          }

          // Order placed successfully!
          toast({ 
              title: "Order Placed!", 
              description: `Order #${result.order?.orderId} received. Verifying payment...`,
              variant: "default",
              duration: 4000 // Give slightly longer for first toast
          });
          
          setIsRedirecting(true);

          // Redirect to dashboard after a delay
          setTimeout(() => {
              router.push('/dashboard/orders'); 
          }, 3000); // Adjust delay as needed
          
      } catch (err: any) {
          console.error("Order submission failed:", err);
          setOrderSubmissionError(err.message || "An unexpected error occurred while placing your order.");
          toast({ title: "Order Failed", description: err.message || "Could not place order.", variant: "destructive" });
          setIsSubmittingOrder(false);
          setIsRedirecting(false);
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0e7ff] to-[#f5f3ff] text-gray-900 p-4 md:p-8 lg:p-12 selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto">
         
         {/* Conditionally render Redirecting message or Order Steps */}
         {isRedirecting ? (
             <div className="flex flex-col items-center justify-center text-center py-20 md:py-32">
                 <CheckCircle size={64} className="text-green-500 mb-6 animate-pulse" />
                 <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Order Placed Successfully!</h1>
                 <p className="text-lg text-gray-600 mb-8">Your order is being processed. Please wait while we redirect you to your dashboard...</p>
                 <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
             </div>
         ) : (
            <> { /* Original Order Page Content */ }
                 <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 md:mb-12 text-center relative"
                 >
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600 rounded-full opacity-5 filter blur-3xl"></div>
                    <motion.h1 
                      className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 relative z-10"
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-gray-800">Order:</span> {plan.name}
                    </motion.h1>
                    <motion.p 
                      className="text-md md:text-lg text-gray-600 mt-3 max-w-2xl mx-auto relative z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      Complete the steps below to configure and place your order.
                    </motion.p>
                 </motion.header>

                 <StepIndicator steps={orderSteps} currentStepId={currentStep} />

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
                    {/* Main Content Area (Steps) */}
                    <main className="lg:col-span-7 xl:col-span-8 space-y-8">
                         {/* --- Step 1: Configuration --- */}
                         {currentStep === 'configure' && (
                           <Card className="shadow-lg border-gray-200">
                             <CardHeader>
                               <CardTitle className="text-2xl flex items-center gap-2"><Info size={24} className="text-indigo-500"/> Configuration</CardTitle>
                               <CardDescription>Select your server location and apply any promo codes.</CardDescription>
                             </CardHeader>
                             <CardContent className="space-y-6">
                                <LocationSelector selectedLocation={selectedLocation} onLocationChange={handleLocationChange} />
                                <PromoCodeInput 
                                    promoCode={promoCode} 
                                    onPromoCodeChange={handlePromoCodeChange} 
                                    onApplyPromoCode={handleApplyPromoCode}
                                    isLoading={isApplyingPromo}
                                    appliedMessage={promoCodeMessage}
                                />
                             </CardContent>
                           </Card>
                         )}

                         {/* --- Step 2: Account --- */}
                         {currentStep === 'account' && (
                            <Card className="shadow-xl border-0 rounded-xl overflow-hidden bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm">
                             <CardHeader className="pb-2 bg-gradient-to-r from-[#eef2ff] to-[#f5f3ff]">
                               <CardTitle className="text-2xl flex items-center gap-2">
                                 <div className="p-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                   <UserCheck size={22} />
                                 </div>
                                 <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                   Account Details
                                 </span>
                               </CardTitle>
                               <CardDescription className="text-slate-600">Secure your order with your personal account</CardDescription>
                             </CardHeader>
                             <CardContent className="pt-6">
                                {isAuthLoading ? (
                                  <div className="flex justify-center items-center py-8">
                                    <div className="relative">
                                      <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-600 animate-spin"></div>
                                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <Loader2 className="h-8 w-8 animate-pulse text-indigo-600" />
                                      </div>
                                    </div>
                                    <span className="ml-4 text-gray-600 font-medium">Verifying authentication...</span>
                                  </div>
                                ) : isAuthenticated ? (
                                  // If user is authenticated, show their info
                                  <div className="max-w-md mx-auto">
                                  <UserDisplay />
                                  </div>
                                ) : (
                                  // If user is NOT authenticated, show login/register options
                                  <div className="space-y-6 max-w-lg mx-auto">
                                    <div className="flex justify-center p-1 bg-slate-100 rounded-full mb-4 max-w-md mx-auto">
                                      {/* Login/Register Tabs/Buttons */}
                                      <button 
                                        onClick={() => {
                                          setAuthFormMode('login');
                                          clearError(); // Clear errors when switching modes
                                        }} 
                                        className={`py-2.5 px-6 font-medium text-sm transition-all rounded-full flex items-center justify-center w-1/2
                                          ${authFormMode === 'login' 
                                            ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white shadow-md' 
                                            : 'text-gray-700 hover:bg-slate-200'}`}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                          <polyline points="10 17 15 12 10 7" />
                                          <line x1="15" y1="12" x2="3" y2="12" />
                                        </svg>
                                        Log In
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setAuthFormMode('register');
                                          clearError(); // Clear errors when switching modes
                                        }} 
                                        className={`py-2.5 px-6 font-medium text-sm transition-all rounded-full flex items-center justify-center w-1/2
                                          ${authFormMode === 'register' 
                                            ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white shadow-md' 
                                            : 'text-gray-700 hover:bg-slate-200'}`}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                          <circle cx="8.5" cy="7" r="4" />
                                          <line x1="20" y1="8" x2="20" y2="14" />
                                          <line x1="23" y1="11" x2="17" y2="11" />
                                        </svg>
                                        Sign Up
                                      </button>
                                    </div>
                                    <div className="pt-2">
                                      {authError && (
                                        <motion.div
                                          initial={{ opacity: 0, y: -10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="mb-4"
                                        >
                                          <Alert variant="destructive" className="bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-sm">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription className="text-red-700">
                                              {authError}
                                            </AlertDescription>
                                          </Alert>
                                        </motion.div>
                                      )}
                                      {authFormMode === 'login' ? 
                                          <LoginForm 
                                            onLoginSuccess={handleAuthSuccess}
                                            onSwitchToRegister={() => {
                                              setAuthFormMode('register');
                                              clearError();
                                            }}
                                          /> : 
                                          <RegisterForm 
                                            onRegisterSuccess={handleAuthSuccess}
                                            onSwitchToLogin={() => {
                                              setAuthFormMode('login');
                                              clearError();
                                            }}
                                          />
                                      }
                                    </div>
                                  </div>
                                )}
                             </CardContent>
                           </Card>
                         )}
                         
                        {/* --- Step 3: Payment --- */}
                        {currentStep === 'payment' && (
                            <Card className="shadow-lg border-gray-200">
                             <CardHeader>
                               <CardTitle className="text-2xl flex items-center gap-2"><CreditCard size={24} className="text-indigo-500"/> Payment Information</CardTitle>
                               <CardDescription>Select a manual payment method and upload your proof of transaction.</CardDescription>
                             </CardHeader>
                             <CardContent>
                                 {!isAuthenticated ? (
                                    <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md flex items-center space-x-3 mb-6">
                                        <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0"/>
                                        <div className="flex-grow">
                                            <p className="text-yellow-800 font-medium">Authentication Required</p>
                                            <p className="text-sm text-yellow-700">Please log in or create an account first.</p>
                                        </div>
                                         <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100" onClick={() => setCurrentStep('account')}>
                                            Go to Account
                                        </Button>
                                    </div>
                                 ) : (
                                    <div className="space-y-6">
                                      <PaymentMethodSelector 
                                        selectedMethodId={selectedPaymentMethodId} 
                                        onMethodSelect={handlePaymentMethodSelect} 
                                      />
                                      <PaymentProofUpload 
                                        onUploadSuccess={handleProofUploadSuccess} 
                                        onUploadError={handleProofUploadError}
                                      />
                                      {paymentStepError && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-md flex items-start space-x-2 text-red-700">
                                            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm font-medium">{paymentStepError}</p>
                                        </div>
                                      )}
                                    </div>
                                 )}
                              </CardContent>
                           </Card>
                        )}

                        {/* --- Step 4: Review --- */}
                        {currentStep === 'review' && (
                            <Card className="shadow-lg border-gray-200">
                             <CardHeader>
                               <CardTitle className="text-2xl flex items-center gap-2"><ShieldCheck size={24} className="text-indigo-500"/> Review & Confirm Order</CardTitle>
                               <CardDescription>Please review all your order details carefully before placing the order.</CardDescription>
                             </CardHeader>
                             <CardContent>
                                {/* Add checks similar to payment step, but render ReviewSummary if all good */ 
                                }
                                {!isAuthenticated ? (
                                    <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md flex items-center space-x-3 mb-6">
                                       {/* ... Auth required message ... */} 
                                       <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0"/>
                                        <div className="flex-grow">
                                            <p className="text-yellow-800 font-medium">Authentication Required</p>
                                            <p className="text-sm text-yellow-700">Log in to review your order.</p>
                                        </div>
                                         <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100" onClick={() => setCurrentStep('account')}>
                                            Go to Account
                                        </Button>
                                    </div>
                                ) : !paymentProofUrl || !selectedPaymentMethodId || !selectedLocation ? (
                                    <div className="p-4 bg-orange-50 border border-orange-300 rounded-md flex items-center space-x-3 mb-6">
                                      {/* ... Missing info message ... */} 
                                      <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0"/>
                                        <div className="flex-grow">
                                            <p className="text-orange-800 font-medium">Order Incomplete</p>
                                            <p className="text-sm text-orange-700">Please ensure all previous steps are completed.</p>
                                        </div>
                                         <Button size="sm" variant="outline" className="border-orange-600 text-orange-700 hover:bg-orange-100" onClick={() => setCurrentStep('payment')}>
                                            Go Back
                                        </Button>
                                    </div>
                                ) : (
                                   <ReviewSummary 
                                        plan={plan} 
                                        location={selectedLocationDetails || null}
                                        userEmail={user?.email}
                                        paymentMethodId={selectedPaymentMethodId}
                                        paymentProofFilename={paymentProofFilename}
                                        promoCode={promoDiscount > 0 ? promoCode : null}
                                        basePrice={plan.price}
                                        discount={promoDiscount}
                                        totalPrice={calculatedTotal}
                                    />
                                )
                                }
                                {orderSubmissionError && (
                                    <div className="mt-6 p-3 bg-red-50 border border-red-300 rounded-md flex items-start space-x-2 text-red-700">
                                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm font-medium">Error placing order: {orderSubmissionError}</p>
                                    </div>
                                 )}
                              </CardContent>
                           </Card>
                        )}

                        {/* --- Step Navigation --- */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center"
                          >
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                            variant="outline" 
                            onClick={goToPreviousStep} 
                            disabled={currentStepIndex === 0 || isSubmittingOrder}
                                className="disabled:opacity-50 rounded-xl border-gray-200 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-300 flex items-center gap-2 transition-all duration-200 px-5 py-6"
                            >
                                <ArrowLeft size={18} className="text-gray-500" /> Previous
                            </Button>
                            </motion.div>
                            
                            {currentStepIndex < orderSteps.length - 1 ? (
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                                onClick={goToNextStep} 
                                disabled={isSubmittingOrder}
                                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white disabled:opacity-50 rounded-xl shadow-md shadow-indigo-500/30 transition-all duration-200 flex items-center gap-2 px-5 py-6"
                            >
                                  Next <ArrowRight size={18} className="ml-1" />
                            </Button>
                              </motion.div>
                            ) : (
                              <motion.div 
                                whileHover={{ scale: 1.02 }} 
                                whileTap={{ scale: 0.98 }}
                                className={!isAuthenticated || !paymentProofUrl || !selectedPaymentMethodId || !selectedLocation || isSubmittingOrder || isLoadingPlan || isAuthLoading ? "opacity-70" : ""}
                              >
                            <Button 
                                onClick={handlePlaceOrder} 
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-70 rounded-xl shadow-md shadow-green-500/30 transition-all duration-200 flex items-center gap-2 px-6 py-6"
                                disabled={!isAuthenticated || !paymentProofUrl || !selectedPaymentMethodId || !selectedLocation || isSubmittingOrder || isLoadingPlan || isAuthLoading } 
                            >
                                  { isSubmittingOrder ? (
                                    <>
                                      <div className="mr-2 relative">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <div className="absolute inset-0 animate-ping opacity-30 rounded-full bg-white"></div>
                                      </div>
                                      Placing Order...
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck className="mr-2 h-5 w-5" />
                                      Confirm & Place Order
                                    </>
                                  )}
                            </Button>
                              </motion.div>
                            )}
                        </motion.div>

                        {/* --- Static How-to Guide --- */}
                        <HowToOrderGuide />
                    </main>

                    {/* --- Order Summary Sidebar --- */}
                    <aside className="lg:col-span-5 xl:col-span-4 h-fit lg:sticky lg:top-8">
                       <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5, delay: 0.2 }}
                       >
                         <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-xl">
                            {/* Order Summary Header with Gradient */}
                            <div className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] p-6 text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-xl font-bold">Order Summary</h3>
                                  <p className="mt-1 text-sm opacity-90">Review your plan details</p>
                                </div>
                                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                                  <CheckCircle className="h-6 w-6" />
                                </div>
                              </div>
                            </div>

                            <CardContent className="p-0">
                              {/* Plan Summary Section */}
                              <div className="space-y-5 p-6">
                                <div className="flex items-center">
                                  <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700">
                                    <Server className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">Selected Plan</p>
                                    <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                                  </div>
                                </div>
                                
                                <div className="rounded-xl bg-gradient-to-br from-[#f9fafb] to-[#f3f4f6] p-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col space-y-1">
                                      <span className="text-xs font-medium text-gray-500">CPU</span>
                                      <span className="flex items-center font-medium text-gray-800">
                                        <div className="mr-1.5 h-2 w-2 rounded-full bg-blue-500"></div>
                                        {plan.cpu}
                                      </span>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                      <span className="text-xs font-medium text-gray-500">RAM</span>
                                      <span className="flex items-center font-medium text-gray-800">
                                        <div className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></div>
                                        {plan.ram}
                                      </span>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                      <span className="text-xs font-medium text-gray-500">Storage</span>
                                      <span className="flex items-center font-medium text-gray-800">
                                        <div className="mr-1.5 h-2 w-2 rounded-full bg-purple-500"></div>
                                        {plan.storage}
                                      </span>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                      <span className="text-xs font-medium text-gray-500">Bandwidth</span>
                                      <span className="flex items-center font-medium text-gray-800">
                                        <div className="mr-1.5 h-2 w-2 rounded-full bg-yellow-500"></div>
                                        {plan.bandwidth}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Location & Payment Details */}
                              <div className="border-t border-gray-100 p-6">
                                <div className="space-y-4">
                                  {selectedLocationDetails && (
                                    <motion.div 
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.3 }}
                                      className="flex items-center justify-between"
                                    >
                                      <div className="flex items-center">
                                        <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">Location</span>
                                      </div>
                                      <div className="flex items-center rounded-full bg-gradient-to-r from-[#eef2ff] to-[#eff6ff] px-3 py-1.5 text-sm font-medium text-indigo-700 border border-indigo-100 shadow-sm backdrop-blur-sm">
                                        <span className="mr-1.5 text-base">{selectedLocationDetails.flag}</span>
                                        <motion.span 
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.4 }}
                                        >
                                          {selectedLocationDetails.name} {selectedLocationDetails.city ? 
                                            <span className="text-indigo-500 font-normal">({selectedLocationDetails.city})</span> : ''
                                          }
                                        </motion.span>
                                      </div>
                                    </motion.div>
                                  )}
                                  
                              {selectedPaymentMethodId && (
                                    <motion.div 
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.4 }}
                                      className="flex items-center justify-between"
                                    >
                                      <div className="flex items-center">
                                        <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">Payment</span>
                                      </div>
                                      <div className="rounded-full bg-gradient-to-r from-[#f5f3ff] to-[#eef2ff] px-3 py-1.5 text-sm font-medium capitalize text-indigo-700 border border-purple-100 shadow-sm backdrop-blur-sm flex items-center">
                                        <motion.div 
                                          initial={{ scale: 0, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          transition={{ type: "spring", stiffness: 300, delay: 0.45 }}
                                          className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mr-2 flex-shrink-0"
                                        ></motion.div>
                                        {selectedPaymentMethodId}
                                  </div>
                                    </motion.div>
                              )}
                                  
                              {paymentProofFilename && (
                                    <motion.div 
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.5 }}
                                      className="flex items-center justify-between"
                                    >
                                      <div className="flex items-center">
                                        <CheckCircle2 className="mr-2 h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">Proof</span>
                                      </div>
                                      <div className="flex items-center rounded-full bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 text-xs font-medium text-green-700 border border-green-100 shadow-sm">
                                        <div className="relative mr-2">
                                          <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: [0, 1.2, 1] }}
                                            transition={{ duration: 0.4, delay: 0.5 }}
                                            className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping"
                                          ></motion.div>
                                          <CheckCircle className="h-3.5 w-3.5 relative z-10" />
                                        </div>
                                        <span className="truncate max-w-[140px] text-emerald-700" title={paymentProofFilename}>
                                          {paymentProofFilename}
                                        </span>
                                  </div>
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Pricing Information */}
                              <div className="border-t border-gray-100 bg-gradient-to-br from-[#fafafa] to-[#f5f5f5] p-6">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Base Price</span>
                                    <motion.span 
                                      className="font-medium text-gray-800"
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: 0.2 }}
                                    >
                                      {plan.price.toFixed(2)} PKR
                                    </motion.span>
                                  </div>
                                  
                                  {promoDiscount > 0 && (
                                    <motion.div 
                                      className="flex items-center justify-between"
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      transition={{ delay: 0.3 }}
                                    >
                                      <div className="flex items-center">
                                        <span className="text-sm text-gray-600">Promo</span>
                                        <span className="ml-1.5 rounded-md bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
                                          {promoCode}
                                        </span>
                                      </div>
                                      <span className="font-medium text-green-600">
                                        - {promoDiscount.toFixed(2)} PKR
                                      </span>
                                    </motion.div>
                                  )}
                                  
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <span className="text-base font-semibold text-gray-800">Total</span>
                                      <motion.div 
                                        className="text-xl font-bold relative"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                                      >
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 relative z-10">
                                          {calculatedTotal.toFixed(2)} PKR
                                        </span>
                                        <motion.div 
                                          className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 blur-sm z-0 opacity-0"
                                          animate={{ opacity: [0, 0.7, 0.3] }}
                                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                        />
                                      </motion.div>
                                    </div>
                                  </div>
                                  </div>
                              </div>
                              
                              {/* User & Actions Section */}
                              <div className="border-t border-gray-100 p-6">
                              {user && (
                                  <div className="mb-4 flex items-center justify-center rounded-xl bg-indigo-50 p-3 text-sm">
                                    <UserCheck className="mr-2 h-4 w-4 text-indigo-500" />
                                    <span className="text-indigo-700">
                                      Order for: <span className="font-medium">{user.email}</span>
                                    </span>
                                  </div>
                              )}

                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                               <Button 
                                  variant="outline" 
                                    size="lg"
                                  onClick={() => router.push('/pricing')} 
                                    className="w-full gap-2 rounded-xl border-indigo-200 text-indigo-600 hover:text-indigo-700 hover:border-indigo-300 relative group overflow-hidden"
                                  >
                                    <span className="absolute inset-0 w-0 bg-gradient-to-r from-[#eef2ff] to-[#f5f3ff] transition-all duration-500 ease-out group-hover:w-full"></span>
                                    <ArrowLeft className="h-4 w-4 relative z-10 group-hover:text-indigo-500 transition-colors duration-300" />
                                    <span className="relative z-10">Change Plan</span>
                              </Button>
                                </motion.div>
                              </div>
                          </CardContent>
                       </Card>
                         
                         {/* Order Protection Badge */}
                         <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.6, duration: 0.4 }}
                           whileHover={{ scale: 1.02 }}
                           className="mt-4 flex items-center justify-center rounded-xl border border-indigo-100 bg-gradient-to-r from-[#eef2ff] to-[#e0e7ff] p-3.5 shadow-md relative overflow-hidden group"
                         >
                           <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 w-0 group-hover:w-full transition-all duration-700"></div>
                           <div className="relative z-10 flex items-center">
                             <motion.div
                               initial={{ rotate: 0 }}
                               animate={{ rotate: [0, 15, -15, 0] }}
                               transition={{ duration: 2, delay: 1.2, repeat: Infinity, repeatDelay: 6 }}
                               className="mr-2.5 p-1.5 rounded-full bg-indigo-100 shadow-inner"
                             >
                               <ShieldCheck className="h-4 w-4 text-indigo-600" />
                             </motion.div>
                             <p className="text-sm font-medium text-indigo-700">Your order is protected with secure checkout</p>
                           </div>
                         </motion.div>
                       </motion.div>
                    </aside>
                 </div>
            </> 
         )}
      </div>
    </div>
  );
}
