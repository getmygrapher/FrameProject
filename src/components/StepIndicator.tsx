import React from 'react';
import { Upload, Settings, ShoppingCart, CreditCard, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppStep } from '../types';

const steps: { key: AppStep; label: string; icon: React.ReactNode }[] = [
  { key: 'upload', label: 'Upload', icon: <Upload size={20} /> },
  { key: 'customize', label: 'Customize', icon: <Settings size={20} /> },
  { key: 'cart', label: 'Cart', icon: <ShoppingCart size={20} /> },
  { key: 'checkout', label: 'Checkout', icon: <CreditCard size={20} /> },
  { key: 'confirmation', label: 'Complete', icon: <CheckCircle size={20} /> },
];

export default function StepIndicator() {
  const { state } = useApp();
  
  const currentStepIndex = steps.findIndex(step => step.key === state.currentStep);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  p-3 rounded-full flex items-center justify-center transition-colors
                  ${index <= currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {step.icon}
              </div>
              <div
                className={`
                  text-sm font-medium mt-2 transition-colors
                  ${index <= currentStepIndex ? 'text-blue-600' : 'text-gray-500'}
                `}
              >
                {step.label}
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={`
                  w-12 md:w-24 h-0.5 mx-2 transition-colors
                  ${index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}