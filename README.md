# CDN 管理系统

个人公共资源 CDN 收藏与管理系统，基于 Cloudflare Worker 构建。

## 功能特性

- 搜索 npm/jsDelivr 资源
- 一键转存到 R2
- 自动识别入口文件
- 自动生成 CDN 链接
- 国内/海外双 CDN 加速
- 简单资源管理（查看、删除、复制）

## 技术栈

### 后端
- Cloudflare Worker
- Hono（轻量级 Web 框架）
- TypeScript
- Cloudflare R2（对象存储）
- Cloudflare D1（数据库）

### 前端
- Vue 3
- Vite
- NaiveUI（UI 组件库）
- Pinia（状态管理）
- Vue Router（路由）

## 项目结构

```
CDN管理/
├── worker/              # Worker 后端
│   ├── src/
│   │   ├── routes/     # 路由
│   │   ├── services/   # 服务层
│   │   ├── utils/      # 工具函数
│   │   ├── db/         # 数据库相关
│   │   └── index.ts    # 入口文件
│   └── wrangler.toml   # Worker 配置
├── frontend/            # Vue 3 前端
│   ├── src/
│   │   ├── pages/      # 页面组件
│   │   ├── router/     # 路由配置
│   │   ├── api/        # API 封装
│   │   └── main.ts     # 入口文件
│   └── vite.config.ts  # Vite 配置
├── README.md
├── DEPLOYMENT.md       # 部署指南
├── AGENTS.md           # 项目代理记录
└── .gitignore
```

## 快速开始

### 开发环境

#### 后端开发

```bash
cd worker
npm install
npm run dev
```

#### 前端开发

```bash
cd frontend
npm install
npm run dev
```

### 部署

详细部署步骤请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## License

MIT


