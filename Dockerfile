FROM node:20
WORKDIR /app

COPY ./package*.json ./
RUN rm -rf node_modules package-lock.json && npm install

EXPOSE 5000

COPY . ./
CMD ["npm", "start"]