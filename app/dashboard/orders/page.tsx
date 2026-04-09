'use client';

import React, { useState } from 'react';

const orderItems = [
  {
    name: 'Whey Gold Standard',
    details: '2.27 kg · ×1',
    price: 8500,
  },
  {
    name: 'Creatine Monohydrate',
    details: '300g · ×2',
    price: 9600,
  },
  {
    name: 'C4 Pre-Workout',
    details: '390g · ×1',
    price: 6200,
  },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(2);
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Silva');
  const [addressLine1, setAddressLine1] = useState('123 Main Street');
  const [addressLine2, setAddressLine2] = useState('Apartment, suite, etc.');
  const [city, setCity] = useState('Negombo');
  const [postalCode, setPostalCode] = useState('11500');
  const [phoneNumber, setPhoneNumber] = useState('+94 77 000 0000');
  const [deliveryOption, setDeliveryOption] = useState('standard');

  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  const delivery = 350;
  const discount = subtotal * 0.1; // 10% Gold Member Discount
  const total = subtotal + delivery - discount;

  const steps = [
    { number: 1, label: 'Cart', status: 'completed' },
    { number: 2, label: 'Shipping', status: 'active' },
    { number: 3, label: 'Payment', status: 'upcoming' },
    { number: 4, label: 'Confirm', status: 'upcoming' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Yellow top border */}
      <div className="w-full h-1 bg-[#F4D03F]"></div>

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
                            ? 'bg-[#F4D03F]'
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
          {/* Left - Delivery Information */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-lg p-8">
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
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#F4D03F]"
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
                      className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#F4D03F]"
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
                      className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#F4D03F]"
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
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#F4D03F]"
                  />
                </div>

                {/* Delivery Options */}
                <div className="bg-gray-50 p-6 border-l-4 border-[#F4D03F]">
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
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
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
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900">Express Delivery (1-2 days)</span>
                    </label>
                  </div>
                </div>

                {/* Continue Button */}
                <button className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-sm uppercase tracking-wider px-8 py-4 transition-all">
                  Continue to Payment →
                </button>
              </div>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#2B2621] text-white p-8 sticky top-8">
              <h2 className="text-[#F4D03F] text-xl font-black uppercase tracking-tight mb-6">
                Order Summary
              </h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-700">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <div className="text-white text-sm font-medium mb-1">
                        {item.name}
                      </div>
                      <div className="text-gray-400 text-xs">{item.details}</div>
                    </div>
                    <div className="text-white font-bold">
                      LKR {item.price.toLocaleString()}
                    </div>
                  </div>
                ))}
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
                  <span className="text-[#F4D03F] text-sm font-black uppercase tracking-wider">
                    Total
                  </span>
                  <span className="text-white text-3xl font-black">
                    LKR {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-[#1F1D1B] p-4 text-center border border-gray-700">
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
