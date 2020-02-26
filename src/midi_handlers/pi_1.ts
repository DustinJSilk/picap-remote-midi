import { PiBase, PiHandler } from './pi_base';
import config from '../config/pi_1.json';
import { PiMessage } from 'src/services/midi_server_api';

export default class Pi extends PiBase implements PiHandler {
  private touchTimes = ([...Array(12).fill(0)]);

  constructor() {
    super(config);
  }

  onMessage(data: PiMessage) {
    const lastTouch = this.touchTimes[data.index];
    const timeDiff = Math.abs(Date.now() - lastTouch);

    if (timeDiff > 100) {
      this.sendNote(data.index);
    }
  }
}
