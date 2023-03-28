FROM node:lts-alpine
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . .
EXPOSE 3001
USER node
CMD ["npm", "run", "dev"]
