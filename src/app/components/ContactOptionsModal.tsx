'use client'

import React from 'react';
import { Phone, MessageCircle, X, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ContactOptionsModalProps {
  open: boolean;
  onClose: () => void;
  phoneNumber: string;
  personName: string;
}

export function ContactOptionsModal({ open, onClose, phoneNumber, personName }: ContactOptionsModalProps) {
  if (!open) return null;

  const handleCall = () => {
    window.open(`tel:${phoneNumber}`, '_self');
    onClose();
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`आपको जन्मदिन की हार्दिक शुभकामनाएँ। भगवान से प्रार्थना है कि आपका जीवन स्वस्थ, सुखमय और उज्ज्वल भविष्य से परिपूर्ण हो।  
      आपका जीवन खुशियों और सफलताओं से भरा रहे, यही मेरी मंगलकामना है।  
      - तेजिंदर सिंह तिवाना`);
      
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const handleSMS = () => {
    const message = encodeURIComponent(`आपको जन्मदिन की हार्दिक शुभकामनाएँ। भगवान से प्रार्थना है कि आपका जीवन स्वस्थ, सुखमय और उज्ज्वल भविष्य से परिपूर्ण हो।  
      आपका जीवन खुशियों और सफलताओं से भरा रहे, यही मेरी मंगलकामना है।  
      - तेजिंदर सिंह तिवाना`);
      
    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    window.open(smsUrl, '_self');
    onClose();
  };

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText(phoneNumber);
    toast.success('Phone number copied to clipboard');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Contact {personName}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Phone Number Display */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Phone Number:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyPhoneNumber}
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Copy phone number"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-lg font-mono text-gray-900 dark:text-white mt-1">
            {phoneNumber}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleCall}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            size="lg"
          >
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>

          <Button
            onClick={handleWhatsApp}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>

          <Button
            onClick={handleSMS}
            variant="outline"
            className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            size="lg"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            SMS
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            WhatsApp message will include birthday wishes from ताजिंदर सिंह तिवाना
          </p>
        </div>
      </div>
    </div>
  );
}
