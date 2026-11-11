import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Swap Chef API listening on http://localhost:${config.port}`);
});
