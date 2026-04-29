# Fastify Backend

该目录下是一个独立的 **Fastify + TypeScript** 后端服务骨架，包含：

- 基础工程（TypeScript 编译、开发热重载）
- 环境变量校验（`.env` / `.env.example`）
- 健康检查接口 `GET /healthz`
- Swagger 文档 `GET /docs`（OpenAPI JSON: `/openapi.json`）
- MySQL（Prisma）数据层与示例注册接口 `POST /auth/register`

---

## 目录结构

```text
backend/
  src/
    config/
      env.ts           # 环境变量 schema + 注入 app.env
      logger.ts        # pino 日志配置（脱敏/level）
    plugins/
      swagger.ts       # Swagger/OpenAPI + Swagger UI
    routes/
      health.ts        # GET /healthz
      index.ts         # 路由聚合注册
    app.ts             # buildApp：组装插件/路由/错误处理
    index.ts           # 进程入口：listen 并输出启动信息
  Dockerfile
  docker-compose.fastify.yml
  package.json
  tsconfig.json
  .env.example
```

---

## 本地启动（推荐）

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run dev
```

访问：

- Root：`http://127.0.0.1:3000/`
- Health：`http://127.0.0.1:3000/healthz`
- Swagger UI：`http://127.0.0.1:3000/docs`
- OpenAPI JSON：`http://127.0.0.1:3000/openapi.json`

## MySQL（Docker）+ 迁移 + 启动（推荐）

```bash
cd backend
cp .env.example .env
docker compose -f docker-compose.mysql.yml up -d --build
```

访问：

- Root：`http://localhost:3000/`
- Health：`http://localhost:3000/healthz`
- Swagger UI：`http://localhost:3000/docs`

注册示例（201）：

```bash
curl -X POST "http://localhost:3000/auth/register" \
  -H "content-type: application/json" \
  -d '{"email":"a@example.com","password":"password123"}'
```

---

## 生产构建与启动

```bash
cd backend
npm install
npm run prisma:generate
npm run build
npm run start
```

---

## Docker 启动

```bash
cd backend
cp .env.example .env
docker compose -f docker-compose.fastify.yml up -d --build
```

访问：

- Root：`http://localhost:3000/`
- Health：`http://localhost:3000/healthz`
- Swagger UI：`http://localhost:3000/docs`
- OpenAPI JSON：`http://localhost:3000/openapi.json`

