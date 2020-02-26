import config from './config';
import cookieParser from 'cookie-parser';
import express from 'express';
import logger from 'morgan';
import { PiController } from './controllers';
import http from 'http';
import socketIo from 'socket.io';
import { MidiServerController } from './controllers/midi_server_controller';
import { serverConfig } from './config';

// Init express
const app = express();

// Add middleware/settings/routes to express.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

/** Add MIDI Server and Rasberry Pi controllers. */
if (config.controller.type === 'midi_server') {
  const server = new http.Server(app);
  const io = socketIo(server);
  io.listen(serverConfig.socketPort);

  const pi= new MidiServerController(app, io);

} else if (config.controller.type === 'pi') {
  const pi= new PiController();
}

export { app };
