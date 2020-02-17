import { logger } from '@shared';
import { OK } from 'http-status-codes';
import { Request, Response, Router, Express } from 'express';
import { Output } from 'easymidi';

// TODO Move these consts to the env file.

/** The Socket.io port to listen on. */
export const SOCKET_PORT = 9000;

/** The Express port to listen on. */
export const EXPRESS_PORT = 8080;

/** The route to listen for any server pings. */
export const PING_PATH = '/api/midi_server/ping';

export class MidiServerController {
  private router = Router();

  /** TODO: Add easymidi types. */
  private controllers: {output: any, id: string}[] = [];

  constructor(private app: Express, private io: SocketIO.Server) {
    logger.log('info', 'Starting MIDI Server controller');

    // Tell Express to use the Router.
    this.app.use(this.router);

    // Add a route to ping when searching for a MIDI server.
    this.router.get(PING_PATH,
        async (req: Request, res: Response) => res.sendStatus(OK));

    // Add Socket connections.
    this.io.on('connection', socket =>
        socket.on('midi', data => this.onMidiMessage(data)));
  }

  private onMidiMessage(message: string) {
    const data = JSON.parse(message);
    const output = this.getMidiOutput(data.id);

    output.send('cc', {
      controller: data.index,
      value: 10,
      channel: 0,
    });
  }

  private getMidiOutput(id: string) {
    let controller = this.controllers.find((c) => c.id === id);

    if (!controller) {
      const output = new Output(id, true);
      controller = {output, id};
      this.controllers.push(controller);

      // Close the MIDI output when the app quits.
      process.on('SIGTERM', () => output.close());
    }

    return controller.output;
  }
}
