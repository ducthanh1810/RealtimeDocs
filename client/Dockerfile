FROM node:20-alpine3.18

# RUN addgroup app && adduser -S -G app app

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx next build

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

# CMD ["npm", "run", "dev"]

CMD ["npx", "next", "start"]