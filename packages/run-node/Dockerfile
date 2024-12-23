# 第一阶段：构建阶段
FROM node:18-alpine AS builder

ENV SERVER_APP_BUILD=/app/server-build

WORKDIR ${SERVER_APP_BUILD}

COPY package.json yarn.lock ./

RUN yarn config set registry https://registry.npmmirror.com
RUN yarn

COPY . .
RUN yarn build

# 第二阶段：运行阶段
FROM node:18-alpine

WORKDIR /app/run-server

# 从构建阶段复制构建产物
COPY --from=builder /app/server-build/dist/ .
COPY --from=builder /app/server-build/package.json .
# 直接复制 node_modules 文件夹
COPY --from=builder /app/server-build/node_modules/ ./node_modules/

CMD ["node", "app.js", "--port", "4000"]