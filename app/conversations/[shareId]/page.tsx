'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Markdown from '@/components/ui/markdown';
import { 
  ShareIcon,
  ClipboardIcon,
  CheckIcon,
  CalendarIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SharedConversation {
  title: string;
  messages: Message[];
  createdAt: Date;
  agentId: string;
}

export default function SharedConversationPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  
  const [conversation, setConversation] = useState<SharedConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (shareId) {
      loadSharedConversation();
    }
  }, [shareId]);

  const loadSharedConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${shareId}`);
      const data = await response.json();
      
      if (data.success) {
        setConversation(data.conversation);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error cargando la conversación');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMessage = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando conversación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShareIcon className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Conversación no encontrada</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ChatBubbleLeftIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {conversation.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(conversation.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <ShareIcon className="w-4 h-4" />
                    Conversación compartida
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <ClipboardIcon className="w-4 h-4" />
              )}
              {copied ? 'Copiado' : 'Copiar enlace'}
            </button>
          </div>
        </div>
      </div>

      {/* Conversación */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {conversation.messages.map((message, index) => (
            <MessageBubble
              key={message.id || index}
              message={message}
              onCopy={() => handleCopyMessage(message.content)}
            />
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            Esta conversación fue compartida públicamente desde SamaraCore
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente para cada mensaje
function MessageBubble({ 
  message, 
  onCopy
}: {
  message: Message;
  onCopy: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[80%] ${
        message.role === 'user' 
          ? 'bg-blue-500 text-white' 
          : 'bg-white border border-gray-200'
      } rounded-lg p-4 relative group shadow-sm`}>
        {message.role === 'assistant' ? (
          <Markdown content={message.content} />
        ) : (
          <div className="whitespace-pre-wrap">{message.content}</div>
        )}
        
        <div className={`text-xs mt-2 ${
          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {new Date(message.timestamp).toLocaleString()}
        </div>

        {showActions && (
          <div className="absolute -top-8 right-0 flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
              title="Copiar mensaje"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4 text-green-600" />
              ) : (
                <ClipboardIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 