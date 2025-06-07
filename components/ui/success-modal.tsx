'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionText?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  description,
  actionText = 'Continuar',
  autoClose = false,
  autoCloseDelay = 3000,
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md bg-white dark:bg-gray-900/95 border-gray-200 dark:border-gray-700/50 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/10">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  {title}
                </CardTitle>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            {description}
          </CardDescription>
          
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              {actionText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook para usar el modal de éxito más fácilmente
export function useSuccessModal() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    description: '',
    actionText: 'Continuar',
    autoClose: false,
    autoCloseDelay: 3000,
  });

  const showSuccess = (config: {
    title: string;
    description: string;
    actionText?: string;
    autoClose?: boolean;
    autoCloseDelay?: number;
  }) => {
    setModalState({
      isOpen: true,
      title: config.title,
      description: config.description,
      actionText: config.actionText || 'Continuar',
      autoClose: config.autoClose || false,
      autoCloseDelay: config.autoCloseDelay || 3000,
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const SuccessModalComponent = () => (
    <SuccessModal
      isOpen={modalState.isOpen}
      onClose={closeModal}
      title={modalState.title}
      description={modalState.description}
      actionText={modalState.actionText}
      autoClose={modalState.autoClose}
      autoCloseDelay={modalState.autoCloseDelay}
    />
  );

  return {
    showSuccess,
    SuccessModal: SuccessModalComponent,
  };
} 