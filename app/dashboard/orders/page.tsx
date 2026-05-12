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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
                        className={`text-xs font-black uppercase tracking-widest ${step.status === 'completed'
                            ? 'text-emerald-500'
                            : step.status === 'active'
                              ? 'text-primary'
                              : 'text-muted-foreground/50'
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
                        className={`h-full transition-all duration-500 ${step.status === 'completed'
                            ? 'bg-emerald-500'
                            : step.status === 'active'
                              ? 'bg-primary'
                              : 'bg-border'
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
            <div className="bg-card border border-border rounded-3xl p-8 shadow-xl" style={{ minHeight: '500px' }}>
              {currentStep === 2 && (
                <>
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-foreground">
                    Delivery Information
                  </h2>

                  <div className="space-y-6">
                    {/* First Name and Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    {/* Address Line 1 */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-all"
                      />
                    </div>

                    {/* Address Line 2 */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-all"
                        placeholder="Apartment, suite, etc."
                      />
                    </div>

                    {/* City and Postal Code */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-all"
                      />
                    </div>

                    {/* Delivery Options */}
                    <div className="bg-muted/30 p-6 border-l-4 border-primary rounded-r-xl">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
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
                            className="w-5 h-5 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-foreground font-medium">Standard Delivery (3-5 days)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="delivery"
                            value="express"
                            checked={deliveryOption === 'express'}
                            onChange={(e) => setDeliveryOption(e.target.value)}
                            className="w-5 h-5 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-foreground font-medium">Express Delivery (1-2 days)</span>
                        </label>
                      </div>
                    </div>

                    {/* Continue Button */}
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={items.length === 0}
                      className="bg-primary hover:bg-primary-light text-white font-black text-xs uppercase tracking-widest px-8 py-4 transition-all rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Payment →
                    </button>
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-foreground">
                    Payment Method
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-600">Select how you want to pay for your order.</p>

                    {/* Payment Options */}
                    <div className="space-y-4">
                      {/* Card */}
                      <div
                        onClick={() => setPaymentMethod('card')}
                        className={`p-6 border-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-border bg-background hover:border-muted-foreground/30'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-foreground rounded flex items-center justify-center text-background text-[10px] font-black">CARD</div>
                          <div>
                            <p className="font-black text-foreground text-sm uppercase tracking-tight">PayHere Gateway</p>
                            <p className="text-xs text-muted-foreground font-medium">Secure online payment with cards/bank</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-4 ${paymentMethod === 'card' ? 'border-primary bg-card' : 'border-border bg-card'}`}></div>
                      </div>

                      {/* Cash */}
                      <div
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-6 border-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-border bg-background hover:border-muted-foreground/30'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-emerald-600 rounded flex items-center justify-center text-white text-[10px] font-black">CASH</div>
                          <div>
                            <p className="font-black text-foreground text-sm uppercase tracking-tight">Cash Payment</p>
                            <p className="text-xs text-muted-foreground font-medium">Pay directly at the gym counter</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-4 ${paymentMethod === 'cash' ? 'border-primary bg-card' : 'border-border bg-card'}`}></div>
                      </div>

                      {/* PayHere Direct */}
                      <div
                        onClick={() => setPaymentMethod('payhere')}
                        className={`p-6 border-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'payhere' ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-border bg-background hover:border-muted-foreground/30'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-sky-600 rounded flex items-center justify-center text-white text-[10px] font-black">P.H.</div>
                          <div>
                            <p className="font-black text-foreground text-sm uppercase tracking-tight">PayHere Direct</p>
                            <p className="text-xs text-muted-foreground font-medium">Direct PayHere link payment</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-4 ${paymentMethod === 'payhere' ? 'border-primary bg-card' : 'border-border bg-card'}`}></div>
                      </div>
                    </div>

                    {paymentMethod !== 'card' && (
                      <div className="p-4 bg-amber-500/10 border-l-4 border-amber-500 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-r-lg animate-in slide-in-from-left duration-300">
                        Please contact an Admin to complete your payment. This order will be processed once verified at the counter.
                      </div>
                    )}

                    <div className="flex gap-4 pt-8 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="rounded-xl border border-border text-muted-foreground hover:bg-muted font-black text-xs uppercase tracking-widest px-8 py-4 transition-all"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="bg-primary hover:bg-primary-light text-white font-black text-xs uppercase tracking-widest px-8 py-4 transition-all flex-1 rounded-xl shadow-lg shadow-primary/20"
                      >
                        Review Order →
                      </button>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-foreground">
                    Confirm Order
                  </h2>
                  <div className="space-y-6 text-gray-800">
                    <p>Please review your order summary on the right and confirm your shipping details below.</p>

                    <div className="bg-muted/30 p-6 rounded-2xl border border-border relative">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="absolute top-4 right-4 text-[10px] font-black text-primary hover:opacity-80 uppercase tracking-widest"
                      >
                        Edit
                      </button>
                      <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-4 text-muted-foreground">Shipping To</h3>
                      <p className="font-black text-foreground text-lg uppercase tracking-tight mb-1">{firstName} {lastName}</p>
                      <p className="text-sm text-muted-foreground font-medium">{addressLine1}</p>
                      {addressLine2 && <p className="text-sm text-muted-foreground font-medium">{addressLine2}</p>}
                      <p className="text-sm text-muted-foreground font-medium">{city}, {postalCode}</p>
                      <p className="mt-4 text-xs text-muted-foreground/60 font-black">{phoneNumber}</p>
                      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <span>Method</span>
                        <span className="text-foreground">{deliveryOption === 'express' ? 'Express Delivery' : 'Standard Delivery'}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-8">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="rounded-xl border border-border text-muted-foreground hover:bg-muted font-black text-xs uppercase tracking-widest px-8 py-4 transition-all"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="bg-foreground text-background hover:opacity-90 font-black text-xs uppercase tracking-widest px-8 py-4 transition-all flex-1 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="bg-card text-foreground border border-border rounded-3xl p-8 sticky top-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-primary text-xl font-black uppercase tracking-tight">
                  Order Summary
                </h2>
                {currentStep < 4 && (
                  <button
                    type="button"
                    onClick={() => router.push('/shop')}
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                  >
                    Edit Cart
                  </button>
                )}
              </div>

              {/* Order Items */}
              <div className="space-y-6 mb-6 pb-6 border-b border-border">
                {items.length === 0 ? (
                  <div className="text-gray-400 text-sm py-4">Your cart is empty.</div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="text-foreground text-sm font-black uppercase tracking-tight truncate mb-1">
                          {item.name}
                        </div>
                        <div className="text-muted-foreground text-[10px] font-bold flex gap-3 items-center mt-2">
                          {item.details && <span>{item.details}</span>}
                          {currentStep < 4 ? (
                            <>
                              <div className="flex items-center gap-3 bg-muted rounded-lg px-2 py-1 border border-border">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-4 h-4 flex items-center justify-center hover:text-primary transition-colors font-black"
                                >
                                  -
                                </button>
                                <span className="font-black tabular-nums">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-4 h-4 flex items-center justify-center hover:text-primary transition-colors font-black"
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
                      <div className="text-foreground font-black text-sm ml-4 tabular-nums">
                        LKR {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground tabular-nums">LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-foreground tabular-nums">LKR {delivery.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Gold Member (10%)</span>
                  <span className="text-emerald-500 tabular-nums">-LKR {discount.toLocaleString()}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-primary text-[10px] font-black uppercase tracking-widest">
                    Total
                  </span>
                  <span className="text-foreground text-3xl font-black tabular-nums">
                    LKR {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-muted/50 p-4 text-center border border-border mt-8 rounded-2xl">
                <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                  🔒 Secured by PayHere
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
