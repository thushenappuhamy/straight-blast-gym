'use client';

import React, { useState } from 'react';
import { useCart } from '@/src/context/CartContext';
import { useRouter } from 'next/navigation';
import Toast from '@/src/components/ui/Toast';

export default function CheckoutPage() {
  const { items, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(2);
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Silva');
  const [addressLine1, setAddressLine1] = useState('123 Main Street');
  const [addressLine2, setAddressLine2] = useState('Apartment, suite, etc.');
  const [city, setCity] = useState('Negombo');
  const [postalCode, setPostalCode] = useState('11500');
  const [phoneNumber, setPhoneNumber] = useState('+94 77 000 0000');
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const subtotal = cartTotal;
  const delivery = subtotal > 0 ? 350 : 0;
  const discount = subtotal * 0.1; // 10% Gold Member Discount
  const total = subtotal + delivery - discount;

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          paymentMethod,
          shippingDetails: {
            firstName,
            lastName,
            addressLine1,
            addressLine2,
            city,
            postalCode,
            phoneNumber,
            deliveryOption
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process checkout');
      }

      setToast({ message: 'Order placed successfully!', type: 'success' });
      clearCart();
      setTimeout(() => router.push('/shop'), 800);
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { number: 1, label: 'Cart', status: currentStep > 1 ? 'completed' : 'active' },
    { number: 2, label: 'Shipping', status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'upcoming' },
    { number: 3, label: 'Payment', status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : 'upcoming' },
    { number: 4, label: 'Confirm', status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'active' : 'upcoming' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Primary top border */}
      <div className="w-full h-1 bg-[#E63C2F]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 flex-1">
                      {step.status === 'completed' && (
                        <span className="text-green-600 text-xl">✓</span>
                      )}
                      <span
                        className={`text-sm font-bold uppercase tracking-wider ${
                          step.status === 'completed'
                            ? 'text-green-600'
                                  : step.status === 'active'
                                  ? 'text-gray-900'
                                  : 'text-gray-400'
                        }`}
                      >
                        {step.number}. {step.label}
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  {index < steps.length - 1 && (
                    <div className="w-full h-1 mt-2">
                      <div
                        className={`h-full ${
                          step.status === 'completed'
                            ? 'bg-green-600'
                            : step.status === 'active'
                            ? 'bg-[#E63C2F]'
                            : 'bg-gray-300'
                        }`}
                      ></div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Forms */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-lg p-8" style={{ minHeight: '500px' }}>
              {currentStep === 2 && (
                <>
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
                    Delivery Information
                  </h2>

                  <div className="space-y-6">
                    {/* First Name and Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#F4D03F]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#F4D03F]"
                        />
                      </div>
                    </div>

                    {/* Address Line 1 */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#E63C2F]"
                      />
                    </div>

                    {/* Address Line 2 */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#F4D03F]"
                        placeholder="Apartment, suite, etc."
                      />
                    </div>

                    {/* City and Postal Code */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#E63C2F]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#E63C2F]"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#E63C2F]"
                      />
                    </div>

                    {/* Delivery Options */}
                    <div className="bg-gray-50 p-6 border-l-4 border-[#E63C2F]">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
                        Delivery Options
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="delivery"
                            value="standard"
                            checked={deliveryOption === 'standard'}
                            onChange={(e) => setDeliveryOption(e.target.value)}
                            className="w-5 h-5 text-[#E63C2F] focus:ring-[#E63C2F]"
                          />
                          <span className="text-sm text-gray-900">Standard Delivery (3-5 days)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="delivery"
                            value="express"
                            checked={deliveryOption === 'express'}
                            onChange={(e) => setDeliveryOption(e.target.value)}
                            className="w-5 h-5 text-[#E63C2F] focus:ring-[#E63C2F]"
                          />
                          <span className="text-sm text-gray-900">Express Delivery (1-2 days)</span>
                        </label>
                      </div>
                    </div>

                    {/* Continue Button */}
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={items.length === 0}
                      className="bg-[#E63C2F] hover:bg-[#BD2E26] text-black font-black text-sm uppercase tracking-wider px-8 py-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Payment →
                    </button>
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
                    Payment Method
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-600">Select how you want to pay for your order.</p>

                    {/* Payment Options */}
                    <div className="space-y-4">
                      {/* Card */}
                      <div 
                        onClick={() => setPaymentMethod('card')}
                        className={`p-6 border-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-[#E63C2F] bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-[#111] rounded flex items-center justify-center text-white text-xs font-bold">CARD</div>
                          <div>
                            <p className="font-bold text-gray-900">PayHere Gateway</p>
                            <p className="text-sm text-gray-500">Secure online payment with cards/bank</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-4 ${paymentMethod === 'card' ? 'border-[#E63C2F] bg-white' : 'border-gray-200 bg-white'}`}></div>
                      </div>

                      {/* Cash */}
                      <div 
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-6 border-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-[#E63C2F] bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">CASH</div>
                          <div>
                            <p className="font-bold text-gray-900">Cash Payment</p>
                            <p className="text-sm text-gray-500">Pay directly at the gym counter</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-4 ${paymentMethod === 'cash' ? 'border-[#E63C2F] bg-white' : 'border-gray-200 bg-white'}`}></div>
                      </div>

                      {/* PayHere Direct */}
                      <div 
                        onClick={() => setPaymentMethod('payhere')}
                        className={`p-6 border-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'payhere' ? 'border-[#E63C2F] bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">P.H.</div>
                          <div>
                            <p className="font-bold text-gray-900">PayHere Direct</p>
                            <p className="text-sm text-gray-500">Direct PayHere link payment</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-4 ${paymentMethod === 'payhere' ? 'border-[#E63C2F] bg-white' : 'border-gray-200 bg-white'}`}></div>
                      </div>
                    </div>

                    {paymentMethod !== 'card' && (
                      <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 text-sm font-medium animate-in slide-in-from-left duration-300">
                        Please contact an Admin to complete your payment. This order will be processed once verified at the counter.
                      </div>
                    )}

                    <div className="flex gap-4 pt-8 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-black text-sm uppercase tracking-wider px-8 py-4 transition-all"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="bg-[#E63C2F] hover:bg-[#BD2E26] text-black font-black text-sm uppercase tracking-wider px-8 py-4 transition-all flex-1"
                      >
                        Review Order →
                      </button>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
                    Confirm Order
                  </h2>
                  <div className="space-y-6 text-gray-800">
                    <p>Please review your order summary on the right and confirm your shipping details below.</p>
                    
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 relative">
                      <button 
                        onClick={() => setCurrentStep(2)}
                        className="absolute top-4 right-4 text-xs font-bold text-blue-600 hover:text-blue-800 uppercase"
                      >
                        Edit
                      </button>
                      <h3 className="font-bold text-sm uppercase tracking-wider mb-3 text-gray-900">Shipping To</h3>
                      <p className="font-medium">{firstName} {lastName}</p>
                      <p>{addressLine1}</p>
                      {addressLine2 && <p>{addressLine2}</p>}
                      <p>{city}, {postalCode}</p>
                      <p className="mt-2 text-sm text-gray-500">{phoneNumber}</p>
                      <p className="mt-4 pt-4 border-t border-gray-200 text-sm">
                        <span className="font-bold">Method:</span> {deliveryOption === 'express' ? 'Express Delivery' : 'Standard Delivery'}
                      </p>
                    </div>

                    <div className="flex gap-4 pt-8">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-black text-sm uppercase tracking-wider px-8 py-4 transition-all"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="bg-black hover:bg-gray-900 text-white font-black text-sm uppercase tracking-wider px-8 py-4 transition-all flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Processing...' : `Place Order (LKR ${total.toLocaleString()})`}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#2B2621] text-white p-8 sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[#E63C2F] text-xl font-black uppercase tracking-tight">
                  Order Summary
                </h2>
                {currentStep < 4 && (
                  <button
                    type="button"
                    onClick={() => router.push('/shop')}
                    className="text-xs text-white/50 hover:text-white underline underline-offset-2"
                  >
                    Edit Cart
                  </button>
                )}
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-700">
                {items.length === 0 ? (
                  <div className="text-gray-400 text-sm py-4">Your cart is empty.</div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div>
                        <div className="text-white text-sm font-medium mb-1">
                          {item.name}
                        </div>
                        <div className="text-gray-400 text-xs flex gap-3 items-center mt-2">
                          {item.details && <span>{item.details}</span>}
                          {currentStep < 4 ? (
                            <>
                              <div className="flex items-center gap-3 bg-white/10 rounded px-2 py-1">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-4 h-4 flex items-center justify-center hover:text-white"
                                >
                                  -
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-4 h-4 flex items-center justify-center hover:text-white"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="text-rose-500 hover:text-rose-400 ml-2"
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <span className="font-bold text-white/70 px-2 py-1 bg-white/10 rounded">Qty: {item.quantity}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-white font-bold ml-4">
                        LKR {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-medium">LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Delivery</span>
                  <span className="text-white font-medium">LKR {delivery.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Gold Member Discount (10%)</span>
                  <span className="text-green-500 font-medium">-LKR {discount.toLocaleString()}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-[#E63C2F] text-sm font-black uppercase tracking-wider">
                    Total
                  </span>
                  <span className="text-white text-3xl font-black">
                    LKR {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-[#1F1D1B] p-4 text-center border border-gray-700 mt-8">
                <span className="text-gray-400 text-xs">
                  🔒 Secured with PayHere Payment Gateway
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
