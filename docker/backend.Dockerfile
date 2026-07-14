FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN cd backend && npm install
RUN cd backend && npm run build || true
EXPOSE 5000
CMD ["npm", "run", "dev", "-w", "backend"]
