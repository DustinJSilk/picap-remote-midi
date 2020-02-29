/**
 * Inspired by: https://github.com/alexanderwallin/osc-debugger/blob/master/src/createSocket.js
 */

import { createSocket } from 'dgram';
import { logger } from './logger';

export default async function(port?, address?) {
  return new Promise((resolve, reject) => {
    const udp = createSocket('udp4');

    udp.on('error', err => {
      logger.error('error', err);
      udp.close();
      reject(err);
    });

    if (port !== null) {
      udp.on('listening', () => resolve(udp));
      udp.bind(port, address);
    } else {
      resolve(udp);
    }
  });
}
