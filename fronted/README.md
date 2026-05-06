# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

---

## 生产环境 Docker 部署

- **推荐**：在仓库里进入 `backend/`，用 `docker-compose.mysql.yml` 一键拉起 MySQL + API + 本前端（`web` 服务，对外 **80**）。完整步骤见 **[../backend/DOCKER_DEPLOY.md](../backend/DOCKER_DEPLOY.md)**。
- **镜像定义**：本目录下的 `Dockerfile`（多阶段：`npm run build` → `nginx:alpine`）与 `nginx.docker.conf`（`/` 静态资源，`/api`、`/uploads`、`/docs` 反代到后端容器）。
- **接口基址**：开发时 Vite 将 `/api` 代理到 `http://localhost:3000`；生产时由 `web` 内 Nginx 转发到 `api:3000`，与 `src/utils/env.ts` 中的 `BACKEND_BASE_URL = '/api'` 一致，一般无需改代码。
