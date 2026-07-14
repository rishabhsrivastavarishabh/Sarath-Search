import 'dotenv/config';
import { IndexerService } from './services/indexer.service';

async function start() {
    console.log('Sarath Indexer starting...');
    await IndexerService.processQueue();
}

start().catch(console.error);
