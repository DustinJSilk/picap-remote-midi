import cookieParser from 'cookie-parser';
import express from 'express';
import logger from 'morgan';
import { PiController } from './controllers';
import http from 'http';
import socketIo from 'socket.io';
import { MidiServerController, SOCKET_PORT } from './controllers/midi_server_controller';

// Init express
const app = express();

// Add middleware/settings/routes to express.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

/** Add MIDI Server and Rasberry Pi controllers. */
if (process.env.ENV_TYPE === 'midi_server') {
  const server = new http.Server(app);
  const io = socketIo(server);
  io.listen(SOCKET_PORT);

  const pi= new MidiServerController(app, io);

} else if (process.env.ENV_TYPE === 'pi') {
  const pi= new PiController();
}

export {
  app,
};
