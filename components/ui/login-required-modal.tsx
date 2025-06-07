'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, LogIn, UserPlus, Lock } from 'lucide-react';
import Link from 'next/link';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName?: string;
}

export function LoginRequiredModal({
  isOpen,
  onClose,
  agentName = 'este agente'
}: LoginRequiredModalProps) {
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
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                <Lock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Inicia Sesión para Continuar
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
          <div className="text-center">
            <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-4">
              Para chatear con <span className="font-medium text-gray-900 dark:text-white">{agentName}</span> necesitas una cuenta gratuita.
            </CardDescription>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4 mb-6">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-medium mb-2">✨ Con tu cuenta puedes:</div>
                <ul className="text-left space-y-1 text-xs">
                  <li>• Chatear con todos los agentes</li>
                  <li>• Crear tus propios agentes</li>
                  <li>• Guardar conversaciones</li>
                  <li>• Acceso a funciones premium</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Link href="/auth/login" className="w-full">
              <Button className="w-full bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300 hover:scale-105">
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Button>
            </Link>
            
            <Link href="/auth/register" className="w-full">
              <Button 
                variant="outline" 
                className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Crear Cuenta Gratis
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
            >
              Continuar sin chatear
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook para usar el modal más fácilmente
export function useLoginRequiredModal() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    agentName: ''
  });

  const showLoginRequired = (agentName?: string) => {
    setModalState({
      isOpen: true,
      agentName: agentName || 'este agente'
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const LoginRequiredModalComponent = () => (
    <LoginRequiredModal
      isOpen={modalState.isOpen}
      onClose={closeModal}
      agentName={modalState.agentName}
    />
  );

  return {
    showLoginRequired,
    LoginRequiredModal: LoginRequiredModalComponent,
  };
} 