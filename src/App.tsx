/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, Phone, Video, ArrowLeft, Smile, Paperclip, Mic } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
  time?: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Fetch initial messages if any
    fetch('/api/receive')
      .then(res => res.json())
      .then(data => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages.map((m: any) => ({ 
            ...m, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          })));
        } else {
          // Initial greeting
          setMessages([{
            role: 'model',
            content: 'Olá! Sou o especialista comercial da DS Company. Como posso ajudar o seu negócio a crescer hoje?',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      })
      .catch(console.error);
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg, time: currentTime }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: data.response, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem.', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e1e1dd] flex items-center justify-center font-sans">
      {/* Mobile Container */}
      <div className="w-full max-w-md h-[100dvh] sm:h-[90vh] bg-[#efeae2] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative border border-gray-300">
        
        {/* Header */}
        <header className="bg-[#008069] text-white p-3 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <button className="p-1 -ml-1 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/7.x/initials/svg?seed=DS&backgroundColor=008069" alt="DS Company" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex flex-col ml-1">
              <span className="font-semibold text-[16px] leading-tight">DS Company</span>
              <span className="text-xs text-white/80">online</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mr-1">
            <Video className="w-5 h-5 cursor-pointer" />
            <Phone className="w-5 h-5 cursor-pointer" />
            <MoreVertical className="w-5 h-5 cursor-pointer" />
          </div>
        </header>

        {/* Chat Area */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{
            backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
            backgroundRepeat: 'repeat',
            backgroundSize: 'contain',
            backgroundBlendMode: 'multiply',
            backgroundColor: '#efeae2'
          }}
        >
          <div className="flex justify-center mb-4">
            <span className="bg-[#ffeecd] text-[#54656f] text-xs px-3 py-1 rounded-lg shadow-sm">
              Hoje
            </span>
          </div>
          
          <div className="flex justify-center mb-4">
            <span className="bg-[#ffeecd] text-[#54656f] text-xs px-3 py-2 rounded-lg shadow-sm text-center max-w-[85%]">
              🔒 As mensagens e as chamadas são protegidas com a criptografia de ponta a ponta.
            </span>
          </div>

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`relative max-w-[85%] px-3 py-2 rounded-lg shadow-sm text-[15px] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none' 
                    : 'bg-white text-[#111b21] rounded-tl-none'
                }`}
              >
                {/* Tail */}
                <div className={`absolute top-0 w-3 h-3 ${
                  msg.role === 'user' 
                    ? '-right-2 bg-[#d9fdd3]' 
                    : '-left-2 bg-white'
                }`} style={{ clipPath: msg.role === 'user' ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)' }}></div>
                
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                <div className="text-[11px] text-[#667781] text-right mt-1 -mb-1 flex justify-end items-center gap-1">
                  {msg.time}
                  {msg.role === 'user' && (
                    <svg viewBox="0 0 16 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" className="text-[#53bdeb] fill-current">
                      <path d="M11.801 1.023L8.885 4.304L7.54 2.793L6.35 3.86L8.885 6.708L12.991 2.09L11.801 1.023ZM15.25 1.023L9.293 7.71L7.14 5.297L5.95 6.364L9.293 10.124L16.44 2.09L15.25 1.023ZM4.443 6.708L1.527 3.427L0.182 4.938L4.443 9.71L5.633 8.643L4.443 6.708Z"></path>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-[#111b21] px-4 py-3 rounded-lg rounded-tl-none shadow-sm flex gap-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#f0f2f5] p-2 flex items-end gap-2 z-10">
          <div className="flex-1 bg-white rounded-3xl flex items-end px-2 py-1 shadow-sm min-h-[44px]">
            <button className="p-2 text-[#54656f] hover:text-[#111b21] transition-colors">
              <Smile className="w-6 h-6" />
            </button>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Mensagem"
              className="flex-1 max-h-32 bg-transparent border-none focus:ring-0 focus:outline-none resize-none py-2.5 px-2 text-[15px] text-[#111b21] placeholder-[#8696a0]"
              rows={1}
              style={{ height: 'auto' }}
            />
            <button className="p-2 text-[#54656f] hover:text-[#111b21] transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          {inputText.trim() ? (
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-sm hover:bg-[#008f6f] transition-colors flex-shrink-0 disabled:opacity-50"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-sm hover:bg-[#008f6f] transition-colors flex-shrink-0">
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
