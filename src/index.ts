import config from './config';
import { app } from './server';
import { logger } from './shared';

// Start the server
const port = Number(config.PORT || 3000);
app.listen(port, () => {
  logger.info(config.controller.name + ' started on port: ' + port);
});
