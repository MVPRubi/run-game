# 构建阶段
FROM node:18-alpine as builder

ENV CLIENT_APP_BUILD=/app/client-build

WORKDIR ${CLIENT_APP_BUILD}

# 复制整个项目
COPY . .

# 安装依赖并构建
RUN yarn config set registry https://registry.npmmirror.com
RUN yarn
RUN yarn build

# 生产阶段
FROM nginx:alpine

# 复制构建产物到 nginx 目录
COPY --from=builder /app/client-build/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"] 