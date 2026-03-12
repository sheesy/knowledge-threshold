import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RiArrowLeftLine, RiSaveLine, RiLockLine, RiGlobalLine, RiAddLine, RiCloseLine } from 'react-icons/ri';
import { entriesApi } from '../utils/api';

const TYPES = ['doc', 'code', 'qa', 'link', 'image'];
const TYPE_LABELS = { doc: '📄 文档', code: '💻 代码', qa: '💬 Q&A', link: '🔗 链接', image: '🖼 图片' };
const SOURCES = { original: '原创', curated: '整理', ai_generated: 'AI生成' };

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '', content_type: 'doc', content_body: '',
    source_type: 'original', source_url: '', visibility: 'private',
    domain_tags: [], scene_tags: [],
  });
  const [tagInput, setTagInput] = useState({ domain: '', scene: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    entriesApi.get(id)
      .then(e => setForm({
        title: e.title, content_type: e.content_type, content_body: e.content_body || '',
        source_type: e.source_type, source_url: e.source_url || '',
        visibility: e.visibility, domain_tags: e.domain_tags, scene_tags: e.scene_tags,
      }))
      .catch(() => { toast.error('加载失败'); navigate('/'); })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addTag = (type) => {
    const val = tagInput[type].trim().replace(/,/g, '');
    if (!val) return;
    const key = type === 'domain' ? 'domain_tags' : 'scene_tags';
    if (!form[key].includes(val)) set(key, [...form[key], val]);
    setTagInput(t => ({ ...t, [type]: '' }));
  };

  const removeTag = (type, tag) => {
    const key = type === 'domain' ? 'domain_tags' : 'scene_tags';
    set(key, form[key].filter(t => t !== tag));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('请填写标题'); return; }
    setSaving(true);
    try {
      if (isEdit) { await entriesApi.update(id, form); toast.success('已保存'); }
      else { await entriesApi.create(form); toast.success('已创建'); navigate('/'); }
    } catch (e) { toast.error(e.response?.data?.detail || '保存失败'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 text-sm">加载中...</div>;

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto animate-fade-up">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>
          <RiArrowLeftLine className="w-4 h-4" />
          返回
        </button>
        <div className="flex items-center gap-2">
          {/* Visibility toggle */}
          <button onClick={() => set('visibility', form.visibility === 'private' ? 'public' : 'private')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              form.visibility === 'public'
                ? 'text-jade border-jade/30 bg-jade/10'
                : 'text-gray-400 border-white/10 hover:border-white/20'
            }`}>
            {form.visibility === 'public'
              ? <><RiGlobalLine className="w-3.5 h-3.5" /> 公开</>
              : <><RiLockLine className="w-3.5 h-3.5" /> 私密</>}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary px-4 py-2 text-sm">
            <RiSaveLine className="w-4 h-4" />
            {saving ? '保存中...' : (isEdit ? '保存' : '创建')}
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        className="w-full bg-transparent border-none outline-none text-white font-display font-bold text-2xl placeholder:text-gray-600 mb-4"
        placeholder="知识标题..."
        value={form.title}
        onChange={e => set('title', e.target.value)}
      />

      {/* Type + Source row */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex gap-1.5 p-1 rounded-lg" style={{ background: 'var(--surface)' }}>
          {TYPES.map(t => (
            <button key={t} onClick={() => set('content_type', t)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                form.content_type === t ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}>
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <select
          className="input-base py-1 text-xs w-auto"
          value={form.source_type}
          onChange={e => set('source_type', e.target.value)}>
          {Object.entries(SOURCES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Content body */}
      <div className="glass rounded-xl p-4 mb-4">
        {form.content_type === 'code' ? (
          <textarea
            className="w-full bg-transparent outline-none text-sm font-mono resize-none min-h-64"
            style={{ color: '#A78BFA', caretColor: 'white' }}
            placeholder={`// 粘贴你的代码...\nfunction example() {\n  return 'Hello World';\n}`}
            value={form.content_body}
            onChange={e => set('content_body', e.target.value)}
          />
        ) : form.content_type === 'link' ? (
          <div className="space-y-3">
            <input className="input-base" placeholder="https://..." type="url"
              value={form.source_url} onChange={e => set('source_url', e.target.value)} />
            <textarea
              className="w-full bg-transparent outline-none text-sm resize-none min-h-32"
              style={{ color: 'var(--text)' }}
              placeholder="链接摘要或笔记..."
              value={form.content_body}
              onChange={e => set('content_body', e.target.value)}
            />
          </div>
        ) : (
          <textarea
            className="w-full bg-transparent outline-none text-sm resize-none min-h-64 leading-relaxed"
            style={{ color: 'var(--text)' }}
            placeholder={
              form.content_type === 'qa'
                ? 'Q: 问题是什么？\n\nA: 解答...'
                : '开始记录知识...\n\n支持 Markdown 语法'
            }
            value={form.content_body}
            onChange={e => set('content_body', e.target.value)}
          />
        )}
      </div>

      {/* Tags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[['domain', '领域标签', '如：医学、工程、科研...'], ['scene', '场景标签', '如：问题处理、学习笔记...']].map(([type, label, placeholder]) => (
          <div key={type}>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>{label}</label>
            <div className="flex gap-2 mb-2">
              <input
                className="input-base py-1.5 text-xs flex-1"
                placeholder={placeholder}
                value={tagInput[type]}
                onChange={e => setTagInput(t => ({ ...t, [type]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(type))}
              />
              <button onClick={() => addTag(type)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface2)' }}>
                <RiAddLine className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form[type === 'domain' ? 'domain_tags' : 'scene_tags'].map(tag => (
                <span key={tag} className="tag flex items-center gap-1">
                  {tag}
                  <button onClick={() => removeTag(type, tag)}>
                    <RiCloseLine className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
