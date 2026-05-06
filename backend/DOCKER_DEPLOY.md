# Docker 部署说明（MySQL + API + 前端 Web）

本文描述在 Linux 服务器上使用 `docker-compose.mysql.yml` 的稳定部署流程：对外只暴露 **HTTP 80**（**Vue 静态站点** + Nginx 反代 `/api`、`/uploads`、`/docs` 到内部 `api`），数据库与 API 的 **3000** 不映射到宿主机（可按需调整）。

## 前置条件

- 已安装 **Docker** 与 **Docker Compose**（`docker compose version` 可执行）。
- 服务器已绑定 **公网 IP**（或后续通过域名访问）。
- 阿里云 **安全组入方向** 放行 **TCP 80**（浏览器访问 `http://<公网IP>/` 与 `http://<公网IP>/docs` 必需）。  
  - 若需本机直连 MySQL 调试，再单独放行 **3306**（生产建议不要对 `0.0.0.0/0` 开放 3306）。

## 架构说明

| 服务   | 说明 |
|--------|------|
| `mysql` | MySQL 8.0，数据卷 `mysql_data` 持久化。 |
| `api`   | `backend/Dockerfile` 构建的 Node 应用；启动时执行 `prisma generate`、`migrate deploy` 后运行 `node dist/index.js`。业务接口前缀为 **`/api`**。 |
| `web`   | `fronted/Dockerfile`：先 `npm run build` 产出静态文件，再用内置 Nginx 监听 80；`/` 为前端 SPA，`/api`、`/uploads`、`/docs`、`/openapi.json` 反代到 `api:3000`。 |

前端开发时 `vite` 把 `/api` 代理到本机 `localhost:3000`；**生产环境**由 `web` 容器内的 Nginx 把同路径转到 `api` 服务，因此前端代码里 **`BACKEND_BASE_URL = '/api'`** 无需修改。

## 首次部署

### 1. 获取代码并进入目录

**必须在 `backend` 目录执行 compose**（`web` 的构建上下文为 `../fronted`）：

```bash
cd /path/to/node-web/backend
```

### 2. 环境变量

```bash
cp .env.example .env
# 按需编辑 .env；compose 会用 MYSQL_* 拼 DATABASE_URL，也可在 .env 里单独写 DATABASE_URL
```

生产建议设置强密码（在 `.env` 或导出环境变量后再首次启动）：

```bash
# 示例（首次初始化 MySQL 前设置；若数据卷已存在，改密码需另行迁移或重建卷，见下文「常见问题」）
export MYSQL_PASSWORD='你的强密码'
export MYSQL_ROOT_PASSWORD='你的root强密码'
```

### 3. 避免宿主机占用 80 端口

若宿主机已安装并运行 **systemd 的 nginx**，会与容器 `80:80` 冲突，需先停止：

```bash
systemctl stop nginx 2>/dev/null || true
systemctl disable nginx 2>/dev/null || true
ss -lntp | grep ':80' || true
```

确认 **无其他进程** 监听 `0.0.0.0:80` 后再启动 compose。

### 4. 启动

```bash
docker compose -f docker-compose.mysql.yml up -d --build
```

### 5. 检查状态

```bash
docker compose -f docker-compose.mysql.yml ps
docker compose -f docker-compose.mysql.yml logs --tail=100 api
docker compose -f docker-compose.mysql.yml logs --tail=50 web
```

期望：

- `web`：`0.0.0.0:80->80/tcp`
- `mysql`：`healthy`
- `api`：日志中出现 `server started` / `Server listening`

### 6. 本机验证（在服务器上执行）

```bash
# 前端首页（Vue SPA，一般为 200 + HTML）
curl -sv http://127.0.0.1/ | head

# Swagger（由 api 提供，经 web 反代）
curl -sv http://127.0.0.1/docs | head

# 后端 JSON（路由挂在 /api 下）
curl -sv http://127.0.0.1/api/
```

### 7. 公网验证

浏览器访问：

- `http://<公网IP>/`（日记等前端页面）
- `http://<公网IP>/docs`（Swagger）

若本机 `127.0.0.1` 通、公网不通，检查 **安全组是否绑定到该实例**、入方向是否放行 **80**，以及是否访问了正确的公网 IP。

---

## 前端镜像单独构建（调试用）

在仓库根目录的 `fronted` 下可直接构建镜像（**不启动 api 时 `/api` 会失败**，仅用于验证静态资源或 Nginx 配置）：

```bash
cd /path/to/node-web/fronted
docker build -t node-web-fronted:local .
docker run --rm -p 8080:80 node-web-fronted:local
```

浏览器访问 `http://<宿主机>:8080/`。要与后端联调，请使用上一节的 **compose 一键启动**。

---

## 更新代码后重新部署

```bash
cd /path/to/node-web/backend
git pull

docker compose -f docker-compose.mysql.yml up -d --build
```

仅想强制重建某一服务镜像时：

```bash
docker compose -f docker-compose.mysql.yml build --no-cache api
docker compose -f docker-compose.mysql.yml build --no-cache web
docker compose -f docker-compose.mysql.yml up -d
```

---

## 常用运维命令

```bash
# 查看日志（持续）
docker compose -f docker-compose.mysql.yml logs -f api
docker compose -f docker-compose.mysql.yml logs -f web

# 停止并删除容器（保留数据卷 mysql_data）
docker compose -f docker-compose.mysql.yml down

# 停止并删除容器 + MySQL 数据卷（会清空数据库，慎用）
docker compose -f docker-compose.mysql.yml down -v
```

---

## 常见问题

### 1. Nginx 报错 `host not found in upstream "api"`

`fronted/nginx.docker.conf` 已使用 `resolver 127.0.0.11` 与变量 `proxy_pass`，避免 `web` 先于 `api` 启动时解析失败。若你自行改成固定 `proxy_pass http://api:3000;`，需保证 `web` 与 `api` 在同一 compose 网络且 `api` 已可解析。

### 2. 宿主机 80 已被占用

`docker compose up` 可能失败或 `web` 容器无法绑定端口。处理见上文「避免宿主机占用 80」，或临时把 compose 中 `web` 的端口改为 `"8080:80"` 并在安全组放行 8080。

### 3. `@prisma/client did not initialize` / 构建缺类型

镜像构建阶段已包含 `prisma generate`；运行时命令也包含 `npx prisma generate`。若仍异常，确认 `backend/Dockerfile` 与 `docker-compose.mysql.yml` 与仓库一致后 `--no-cache` 重建 `api`。

### 4. 修改 MySQL 密码不生效

数据在命名卷 `mysql_data` 中，**首次初始化后**仅改环境变量不会自动改库内密码。需要要么在库内执行 `ALTER USER`，要么 `down -v` 清空卷后重新 `up`（会丢数据）。

### 5. 日志提示 `/app/uploads` 不存在

为静态文件根目录告警。可在后续版本为 `api` 增加 volume 挂载 `uploads` 目录，或在镜像/启动脚本中创建该目录。

### 6. 仅 API、不要前端网关

可使用 `docker-compose.fastify.yml`，或在 compose 中删除 `web` 并为 `api` 增加 `ports: - "3000:3000"`，同时在安全组放行对应端口（不推荐生产直接暴露应用端口）。

---

## 相关文件

| 文件 | 作用 |
|------|------|
| `docker-compose.mysql.yml` | 编排 `mysql` / `api` / `web` |
| `backend/Dockerfile` | 后端多阶段构建 |
| `fronted/Dockerfile` | 前端构建 + Nginx 运行镜像 |
| `fronted/nginx.docker.conf` | 静态站 + `/api` 等反代 |
| `backend/.env.example` | 后端环境变量模板 |
