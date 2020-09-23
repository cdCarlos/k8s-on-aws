FROM node:lts-slim

WORKDIR /app

COPY ./package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD [ "/usr/local/bin/node", "app.js" ]
