import 'dotenv/config';
import app from './app.js';
import { logger } from './lib/logger.js';

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV ?? 'development' }, 'Server running');
});
