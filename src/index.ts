import './load_env'; // Must be the first import
import { app } from 'src/server';
import { logger } from '@shared';

// Start the server
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  logger.info(process.env.ENV_NAME + ' started on port: ' + port);
});
