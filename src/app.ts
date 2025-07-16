import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from '../config/default';
import routing from './routing';
import logger from './setup/logging';

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({}));
app.set('trust proxy', true);
app.set('port', config.app.port);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Attach routes
routing(app).then(() => {
  logger.debug('Database loaded');
});

export default app; 