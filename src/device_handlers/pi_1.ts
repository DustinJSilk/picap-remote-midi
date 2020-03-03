import { PiBase, PiHandler } from './pi_base';
import config from '../config/pi_1.json';
import { PiMessage } from '../services/midi_server_api';
import { HueLight } from './hue_light';

export default class Pi extends PiBase implements PiHandler {
  private touchTimes = ([...Array(12).fill(0)]);

  private light = new HueLight('Spot');

  constructor() {
    super(config);
  }

  onMessage(data: PiMessage) {
    const lastTouch = this.touchTimes[data.index];
    const timeDiff = Math.abs(Date.now() - lastTouch);

    this.sendNote(data.index);

    const hue = data.index / 11;
    this.light.setHue(hue);
  }
}
