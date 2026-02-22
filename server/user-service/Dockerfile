FROM node:24-alpine

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package*.json tsconfig.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate --schema prisma/schema.prisma

COPY src ./src

EXPOSE 3001
CMD ["npm", "run", "dev"]
