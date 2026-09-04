'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Phone, BookOpen } from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { EYTService, Message } from '@/lib/eyt-service';

export default function MessagesPage() {
  const { profile } = useGlobal();
  const isOwner = profile?.role === 'owner';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = () => {
    setMessages(EYTService.getMessages());
  };

  useEffect(() => {
    loadMessages();
  }, [profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const recipientId = isOwner ? 'parent-demo-id' : 'sarah-owner-id';
    EYTService.sendMessage(inputText.trim(), recipientId);
    setInputText('');
    loadMessages();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-[#D4A017]" />
            Direct Communication
          </div>
          <h1 className="font-heading text-2xl font-bold text-[#1E4E8C]">
            Messages & Session Feedback
          </h1>
          <p className="text-xs text-[#6B7280]">
            {isOwner
              ? 'Send session feedback, share homework observations, and answer parent queries.'
              : 'Direct messaging channel with Mrs Sarah for tutorial questions and updates.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <a
            href="tel:09133651659"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] font-semibold hover:bg-[#d8e6f7] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#D4A017]" />
            <span>09133651659</span>
          </a>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
        {/* Chat partner ribbon */}
        <div className="px-6 py-3.5 bg-[#1E4E8C] text-white flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-[#D4A017]">
              <BookOpen className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-white">
                {isOwner ? 'Conversation with Mrs Elizabeth Adeleke' : 'Mrs Sarah (Early Years Tutor)'}
              </h3>
              <p className="text-[11px] text-blue-100">
                {isOwner ? 'Parent of Leo & Amara' : 'Montessori & British Curriculum Specialist'}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-200 px-2.5 py-0.5 rounded-full">
            Active
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#F3F7FD]/30">
          {messages.map((msg) => {
            const isMe = msg.sender_profile_id === profile?.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-[#14263F]">
                    {msg.sender_name || (isMe ? 'You' : 'Mrs Sarah')}
                  </span>
                  <span className="text-[10px] text-[#6B7280]">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-[#1E4E8C] text-white rounded-br-none shadow-xs'
                      : 'bg-white text-[#14263F] border border-gray-200 rounded-bl-none shadow-xs'
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isOwner ? 'Write a message or session feedback note to the parent...' : 'Ask Mrs Sarah a question or share an update on your child...'}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-[#D4A017] text-white font-bold text-sm hover:bg-[#A9790A] transition-all shadow-sm shadow-amber-200 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
