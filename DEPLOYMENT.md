# 部署指南

## 前置条件

- 已安装 Node.js 和 npm
- 已注册 Cloudflare 账号
- 已安装 Wrangler CLI

## 部署步骤

### 1. 配置 Cloudflare

```bash
# 登录 Cloudflare
cd worker
npm install
npx wrangler login
```

### 2. 创建 D1 数据库

```bash
cd worker
npm run db:create
```

复制输出的数据库 ID，更新 `worker/wrangler.toml` 中的 `database_id`。

### 3. 初始化数据库表

```bash
npm run db:migrate
```

### 4. 创建 R2 存储桶

在 Cloudflare 控制台创建 R2 存储桶，名称为 `morutea-cdn`（或在 `wrangler.toml` 中修改为你创建的名称）。

### 5. 配置域名

在 `worker/wrangler.toml` 中修改 `CDN_DOMAIN` 和 `GLOBAL_CDN_DOMAIN` 为你的域名。

### 6. 部署 Worker

```bash
npm run deploy
```

### 7. 部署前端

```bash
cd ../frontend
npm run build
```

将 `dist` 目录部署到任意静态托管服务（如 Cloudflare Pages、GitHub Pages 等）。

## 开发

### 后端开发

```bash
cd worker
npm run dev
```

### 前端开发

```bash
cd frontend
npm run dev
```
