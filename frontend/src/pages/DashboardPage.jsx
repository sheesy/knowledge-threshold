import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiAddLine, RiSearchLine, RiFileTextLine, RiCodeLine, RiQuestionLine, RiLinkLine, RiImageLine, RiDeleteBinLine, RiEditLine, RiLockLine, RiGlobalLine } from 'react-icons/ri';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { entriesApi, searchApi } from '../utils/api';
import useAuthStore from '../store/authStore';

const TYPE_CONFIG = {
  doc:   { icon: RiFileTextLine,  label: '文档',   cls: 'badge-doc' },
  code:  { icon: RiCodeLine,      label: '代码',   cls: 'badge-code' },
  qa:    { icon: RiQuestionLine,  label: 'Q&A',    cls: 'badge-qa' },
  link:  { icon: RiLinkLine,      label: '链接',   cls: 'badge-link' },
  image: { icon: RiImageLine,     label: '图片',   cls: 'badge-image' },
};

const FILTERS = [
  { value: '', label: '全部' },
  { value: 'doc',   label: '文档' },
  { value: 'code',  label: '代码' },
  { value: 'qa',    label: 'Q&A' },
  { value: 'link',  label: '链接' },
];

function EntryCard({ entry, onDelete }) {
  const navigate = useNavigate();
  const cfg = TYPE_CONFIG[entry.content_type] || TYPE_CONFIG.doc;
  const Icon = cfg.icon;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('确认删除这条知识？')) return;
    try {
      await entriesApi.delete(entry.id);
      toast.success('已删除');
      onDelete(entry.id);
    } catch { toast.error('删除失败'); }
  };

  return (
    <div
      onClick={() => navigate(`/edit/${entry.id}`)}
      className="glass glass-hover rounded-xl p-4 cursor-pointer transition-all group relative"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'var(--surface2)' }}>
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${cfg.cls}`}>
              {cfg.label}
            </span>
            {entry.visibility === 'private'
              ? <RiLockLine className="w-3 h-3 text-gray-600" />
              : <RiGlobalLine className="w-3 h-3" style={{ color: 'var(--jade)' }} />}
          </div>
          <h3 className="font-medium text-sm text-white truncate">{entry.title}</h3>
          {entry.content_body && (
            <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
              {entry.content_body.replace(/[#*`>]/g, '').slice(0, 100)}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {entry.domain_tags.slice(0, 3).map(t => (
              <span key={t} className="tag text-xs">{t}</span>
            ))}
            <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
              {formatDistanceToNow(new Date(entry.updated_at), { locale: zhCN, addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
      {/* Actions on hover */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={e => { e.stopPropagation(); navigate(`/edit/${entry.id}`); }}
          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors">
          <RiEditLine className="w-3.5 h-3.5 text-gray-400" />
        </button>
        <button onClick={handleDelete}
          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-red-500/20 transition-colors">
          <RiDeleteBinLine className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [searching, setSearching] = useState(false);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await entriesApi.list({ content_type: filter || undefined });
      setEntries(data);
    } catch { toast.error('加载失败'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQ.trim()) { loadEntries(); return; }
    setSearching(true);
    try {
      const data = await searchApi.search(searchQ, 'mine');
      setEntries(data);
    } catch { toast.error('搜索失败'); }
    finally { setSearching(false); }
  };

  const handleDelete = (id) => setEntries(prev => prev.filter(e => e.id !== id));

  const stats = {
    total: entries.length,
    public: entries.filter(e => e.visibility === 'public').length,
  };

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <h1 className="font-display font-bold text-2xl text-white">
          你好，{user?.username} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          你已积累 <span style={{ color: 'var(--jade)' }} className="font-semibold">{stats.total}</span> 条知识，
          其中 <span className="font-semibold text-white">{stats.public}</span> 条公开共享
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-5 flex-col sm:flex-row animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleSearch} className="flex-1 relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            className="input-base pl-9"
            placeholder="搜索知识..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
        </form>
        <div className="flex gap-1.5">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => { setFilter(f.value); setSearchQ(''); }}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                filter === f.value
                  ? 'bg-jade/15 text-jade font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Entry grid */}
      {loading || searching ? (
        <div className="text-center py-16 text-gray-500 text-sm">加载中...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--surface)' }}>
            <RiFileTextLine className="w-7 h-7 text-gray-600" />
          </div>
          <p className="text-sm font-medium text-white mb-1">还没有知识条目</p>
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>记录你的第一条知识吧</p>
          <button onClick={() => navigate('/new')} className="btn-primary inline-flex">
            <RiAddLine className="w-4 h-4" /> 新建知识
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger">
          {entries.map(e => <EntryCard key={e.id} entry={e} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}
