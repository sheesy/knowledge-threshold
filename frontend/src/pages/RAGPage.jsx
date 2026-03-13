import React, { useState } from 'react';
import { RiSendPlaneLine, RiRobotLine, RiUserLine, RiBookLine } from 'react-icons/ri';
import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('kt_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default function RAGPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: '你好！我是你的知识库助手。你可以问我任何关于你已记录知识的问题，我会根据你的知识库内容来回答。',
    sources: []
  }]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await api.post('/api/rag/ask', { question: q });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '请求失败，请稍后再试。',
        sources: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col p-5 md:p-8 max-w-3xl mx-auto" style={{ height: 'calc(100vh - 48px)' }}>
      <div className="mb-6 animate-fade-up">
        <div className="flex items-center gap-2 mb-1">
          <RiRobotLine className="w-5 h-5" style={{ color: 'var(--jade)' }} />
          <h1 className="font-display font-bold text-2xl text-white">AI 知识问答</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>基于你的知识库智能回答</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                style={{ background: 'rgba(0,200,150,0.15)' }}>
                <RiRobotLine className="w-4 h-4" style={{ color: 'var(--jade)' }} />
              </div>
            )}
            <div className="max-w-lg">
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' ? 'text-black font-medium' : 'glass text-white'
              }`} style={msg.role === 'user' ? { background: 'var(--jade)' } : {}}>
                {msg.content}
              </div>
              {msg.sources?.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <RiBookLine className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">来源：</span>
                  {msg.sources.map(s => (
                    <span key={s} className="tag text-xs">{s}</span>
                  ))}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                style={{ background: 'var(--surface2)' }}>
                <RiUserLine className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,200,150,0.15)' }}>
              <RiRobotLine className="w-4 h-4" style={{ color: 'var(--jade)' }} />
            </div>
            <div className="glass px-4 py-3 rounded-2xl text-sm text-gray-400 flex gap-1 items-center">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>·</span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>·</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>·</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <input
          className="input-base flex-1"
          placeholder="向你的知识库提问..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAsk()}
        />
        <button onClick={handleAsk} disabled={loading || !question.trim()}
          className="btn-primary px-4 disabled:opacity-50 flex-shrink-0">
          <RiSendPlaneLine className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}