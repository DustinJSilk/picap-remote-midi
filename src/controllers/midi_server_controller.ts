import { logger } from '@shared';
import { OK } from 'http-status-codes';
import { Request, Response, Router, Express } from 'express';
import { serverConfig } from '../config';
import { PiHandler } from 'src/midi_handlers/pi_base';

export class MidiServerController {
  private router = Router();

  private handlers: {handler: PiHandler, name: string}[] = [];

  constructor(private app: Express, private io: SocketIO.Server) {
    logger.log('info', 'Starting MIDI Server controller');

    // Tell Express to use the Router.
    this.app.use(this.router);

    // Add a route to ping when searching for a MIDI server.
    this.router.get(serverConfig.pingPath,
        async (req: Request, res: Response) => res.sendStatus(OK));

    // Add Socket listeners.
    this.io.on('connection', socket =>
        socket.on('midi', data => this.onMidiMessage(data)));
  }

  private onMidiMessage(message: string) {
    const data = JSON.parse(message);
    const handler = this.getHandler(data.id);
    handler.onMessage(data);
  }

  /** Returns the class that manages the events. */
  private getHandler(name: string) {
    let item = this.handlers.find((c) => c.name === name);

    if (!item) {
      const Pi = require(`../midi_handlers/${name}.ts`).default;
      const handler = new Pi(name, true);
      item = {handler, name};
      this.handlers.push(item);
    }

    return item.handler;
  }
}
