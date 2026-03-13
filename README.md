# 知识阈值 · Knowledge Threshold

> 个人 AI 知识管理平台 — 让每个人都能站在已知的边界上，向未知迈出下一步

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Tailwind CSS |
| 后端 | Python FastAPI + SQLite |
| 认证 | JWT (python-jose) |
| 前端部署 | Vercel |
| 后端部署 | Render|

---

## 本地开发

### 1. 启动后端

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API 文档自动生成：http://localhost:8000/docs

### 2. 启动前端

```bash
cd frontend
npm install
# 创建 .env.local
echo "REACT_APP_API_URL=http://localhost:8000" > .env.local
npm start
```

前端运行在：http://localhost:3000

---

## 部署到 Vercel + Render

### 步骤一：上传代码到 GitHub

```bash
git init
git add .
git commit -m "feat: initial MVP"
git remote add origin https://github.com/YOUR_USERNAME/knowledge-threshold.git
git push -u origin main
```

### 步骤二：部署后端到 Render

1. 前往 https://render.com 注册账号
2. New → Web Service → 连接你的 GitHub 仓库
3. 配置：
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. 添加环境变量：`SECRET_KEY` = 任意随机字符串
5. 点击 Deploy，等待完成，复制后端 URL（如 `https://knowledge-threshold-api.onrender.com`）

### 步骤三：部署前端到Vercel


---

## 项目结构

```
knowledge-threshold/
├── backend/
│   ├── main.py              # FastAPI 入口
│   ├── requirements.txt
│   ├── core/
│   │   ├── database.py      # SQLAlchemy + SQLite
│   │   └── security.py      # JWT 认证
│   ├── models/
│   │   ├── user.py
│   │   └── entry.py
│   └── routers/
│       ├── auth.py          # 注册/登录
│       ├── entries.py       # 知识条目 CRUD
│       └── search.py        # 关键词搜索
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css        # Tailwind + 自定义样式
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx   # 知识库主页
│   │   │   ├── EditorPage.jsx      # 编辑器
│   │   │   └── ExplorePage.jsx     # 公共知识浏览
│   │   ├── components/
│   │   │   └── Layout.jsx   # 侧边栏布局
│   │   ├── store/
│   │   │   └── authStore.js # Zustand 状态
│   │   └── utils/
│   │       └── api.js       # Axios 封装
│   └── package.json
├── .github/workflows/
│   └── deploy.yml           # 自动部署 CI/CD
├── render.yaml              # Render 部署配置
└── README.md
```

---

## Phase 2 规划（AI 核心）

- [ ] pgvector 向量存储（迁移到 PostgreSQL）（已完成）
- [ ] 语义搜索（OpenAI embeddings 或 bge-m3 本地模型）
- [ ] RAG 知识问答（对自己的知识库提问）（已完成）
- [ ] 知识图谱可视化（D3.js）
- [ ] 知识相似度检测去重
- [ ] 共享知识库，学习路径规划


