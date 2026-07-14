FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN cd frontend && npm install
RUN cd frontend && npm run build
EXPOSE 3000
CMD ["npm", "run", "dev", "-w", "frontend"]
