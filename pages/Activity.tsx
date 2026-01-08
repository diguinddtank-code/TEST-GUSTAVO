import React, { useState } from 'react';
import { Notification } from '../types';
import { Mail, MessageCircle, CheckCircle2 } from 'lucide-react';

const initialMessages: Notification[] = [
  {
    id: '1',
    from: 'Coach Mike',
    message: 'Great positioning in the video "Goal vs Corinthians". Keep it up!',
    time: '2h',
    read: false,
    type: 'feedback'
  },
  {
    id: '2',
    from: 'Academy System',
    message: 'Your video "Training Day 1" has been approved.',
    time: '1d',
    read: true,
    type: 'system'
  },
  {
    id: '3',
    from: 'Admin',
    message: 'Please update your weight stats in your profile.',
    time: '3d',
    read: true,
    type: 'system'
  }
];

export const Activity: React.FC = () => {
  const [messages, setMessages] = useState<Notification[]>(initialMessages);

  const handleRead = (id: string) => {
    setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, read: true } : msg
    ));
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="pb-32 pt-6 px-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Inbox</h1>
          {unreadCount > 0 ? (
             <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">{unreadCount} New</span>
          ) : (
             <span className="bg-slate-100 text-slate-400 text-xs font-bold px-2.5 py-1 rounded-full">All Read</span>
          )}
      </div>
      
      <div className="space-y-4">
          {messages.map(msg => (
              <button 
                key={msg.id} 
                onClick={() => handleRead(msg.id)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 active:scale-[0.98] ${msg.read ? 'bg-white border-slate-100 shadow-sm' : 'bg-white border-blue-100 shadow-md shadow-blue-100/50 ring-1 ring-blue-50'}`}
              >
                  <div className="flex items-start space-x-4">
                      <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.type === 'feedback' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {msg.type === 'feedback' ? <MessageCircle size={20} /> : <CheckCircle2 size={20} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                              <span className={`text-sm ${msg.read ? 'font-semibold text-slate-700' : 'font-extrabold text-slate-900'}`}>{msg.from}</span>
                              <span className="text-[10px] font-bold text-slate-400">{msg.time}</span>
                          </div>
                          <p className={`text-sm leading-relaxed ${msg.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                              {msg.message}
                          </p>
                      </div>
                      
                      {!msg.read && (
                          <div className="mt-2 w-2 h-2 bg-blue-600 rounded-full shadow-sm shadow-blue-400"></div>
                      )}
                  </div>
              </button>
          ))}
      </div>
      
      <div className="mt-12 flex flex-col items-center justify-center text-slate-300 space-y-3">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
             <Mail size={24} strokeWidth={1.5} />
          </div>
          <p className="text-xs font-medium">No more messages</p>
      </div>
    </div>
  );
};