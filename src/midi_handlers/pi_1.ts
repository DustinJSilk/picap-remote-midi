import { PiBase, PiHandler } from './pi_base';
import config from '../config/pi_1.json';
import { PiMessage } from 'src/services/midi_server_api';

export default class Pi extends PiBase implements PiHandler {
  constructor() {
    super(config);
  }

  onMessage(data: PiMessage) {
    this.queueNote(data.index);
  }
}
