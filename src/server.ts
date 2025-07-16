import http from 'http';
import config from '../config/default';
import app from './app';

const server = http.createServer(app);

server.listen(config.app.port, () => {
  console.log(`\nApplication listening on ${config.app.baseUrl}\nEnvironment => ${config.app.environment}\nDate: ${new Date()}`);
}); 