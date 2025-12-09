# 1단계: 빌드 스테이지
FROM node:20-alpine AS build

WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# 프로덕션 빌드
RUN npm run build

# 2단계: Nginx 실행 스테이지
FROM nginx:alpine

# 빌드된 파일을 nginx로 복사
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx 설정 파일 복사 (나중에 생성)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
