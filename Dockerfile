FROM node:20.10.0
#Create app directory
WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install
COPY . .
COPY .env .env
EXPOSE 9000
CMD ["node", "app.js"]