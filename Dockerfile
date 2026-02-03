FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

COPY tsconfig.json ./
COPY src ./src

EXPOSE 3000

CMD ["yarn", "start"]
