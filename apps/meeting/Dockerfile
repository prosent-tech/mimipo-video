# docker build -t express-app .
# docker run -p 8080:8080 express-app
FROM node:22-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "start:backend"]
