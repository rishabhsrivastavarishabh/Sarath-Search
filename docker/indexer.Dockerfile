FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN cd indexer && npm install
CMD ["npm", "run", "dev", "-w", "indexer"]
