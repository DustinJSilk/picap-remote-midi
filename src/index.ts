import config from './config';
import { app } from 'src/server';
import { logger } from '@shared';
import { HueLight } from './device_handlers/hue_light';

// Start the server
const port = Number(config.PORT || 3000);
app.listen(port, () => {
  logger.info(config.controller.name + ' started on port: ' + port);
});
