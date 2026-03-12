import React, { useEffect, useState } from 'react';
import { RiSearchLine, RiFileTextLine, RiGlobalLine } from 'react-icons/ri';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { entriesApi, searchApi } from '../utils/api';

const TYPE_LABELS = { doc: '文档', code: '代码', qa: 'Q&A', link: '链接', image: '图片' };
const TYPE_CLS = { doc: 'badge-doc', code: 'badge-code', qa: 'badge-qa', link: 'badge-link', image: 'badge-image' };

export default function ExplorePage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    entriesApi.listPublic()
      .then(setEntries)
      .catch(() => toast.error('加载失败'))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQ.trim()) {
      entriesApi.listPublic().then(setEntries);
      return;
    }
    try {
      const data = await searchApi.search(searchQ, 'public');
      setEntries(data);
    } catch { toast.error('搜索失败'); }
  };

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-2 mb-1">
          <RiGlobalLine className="w-5 h-5" style={{ color: 'var(--jade)' }} />
          <h1 className="font-display font-bold text-2xl text-white">公共知识空间</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          发现社区分享的知识，共建知识库
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          className="input-base pl-10"
          placeholder="搜索公共知识..."
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />
      </form>

      {loading ? (
        <div className="text-center py-16 text-gray-500 text-sm">加载中...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--surface)' }}>
            <RiFileTextLine className="w-7 h-7 text-gray-600" />
          </div>
          <p className="text-sm text-white mb-1">暂无公开知识</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>成为第一个共享知识的人吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger">
          {entries.map(entry => (
            <div key={entry.id} className="glass glass-hover rounded-xl p-4 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${TYPE_CLS[entry.content_type] || 'badge-doc'}`}>
                  {TYPE_LABELS[entry.content_type] || '文档'}
                </span>
                <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                  {formatDistanceToNow(new Date(entry.updated_at), { locale: zhCN, addSuffix: true })}
                </span>
              </div>
              <h3 className="font-medium text-sm text-white mb-1">{entry.title}</h3>
              {entry.content_body && (
                <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                  {entry.content_body.replace(/[#*`>]/g, '').slice(0, 120)}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {entry.domain_tags.slice(0, 4).map(t => (
                  <span key={t} className="tag text-xs">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
