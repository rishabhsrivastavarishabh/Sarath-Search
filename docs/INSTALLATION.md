# Sarath Search Engine Documentation

## Overview
Sarath is a premium, fully local search engine designed to crawl, index, and search the web without any external API dependencies. It uses a custom inverted index with BM25 ranking for high-relevance search results.

## Architecture
- **Crawler**: Node.js based distributed crawler using Axios and Cheerio. Respects robots.txt.
- **Indexer**: Custom tokenization, stemming, and inverted index storage in PostgreSQL.
- **Search Core**: BM25 ranking algorithm with Redis query caching.
- **Backend**: Express.js API providing search and admin endpoints.
- **Frontend**: Next.js App Router with a premium, minimalistic UI.

## Installation & Setup

### Prerequisites
- Docker & Docker Compose
- Node.js v20+ (for local development)

### Quick Start (Docker)
1. Clone the repository.
2. Run the following command:
   \`\`\`bash
   docker-compose up -d
   \`\`\`
3. Access the frontend at `http://localhost:3000`
4. Access the admin panel at `http://localhost:3000/admin`

### Local Development
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Start the backend:
   \`\`\`bash
   npm run dev -w backend
   \`\`\`
3. Start the frontend:
   \`\`\`bash
   npm run dev -w frontend
   \`\`\`
4. Start the crawler and indexer in separate terminals:
   \`\`\`bash
   npm run dev -w crawler
   npm run dev -w indexer
   \`\`\`

## Search Flow
User Query $\rightarrow$ Query Processor $\rightarrow$ Tokenizer $\rightarrow$ Stemmer $\rightarrow$ Inverted Index (DB) $\rightarrow$ BM25 Scoring $\rightarrow$ Result Ranking $\rightarrow$ Frontend Rendering.

## Crawling Flow
Seed URLs $\rightarrow$ Redis Queue $\rightarrow$ Crawler $\rightarrow$ Content Extraction $\rightarrow$ Deduplication $\rightarrow$ Indexing Queue $\rightarrow$ Indexer $\rightarrow$ Inverted Index (DB).

## API Endpoints
- `GET /api/search?q=...` - Execute a search query.
- `GET /api/suggest?q=...` - Get search suggestions.
- `GET /api/admin/stats` - Get system statistics.
