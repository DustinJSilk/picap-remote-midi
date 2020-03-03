import { PiBase, PiHandler } from './pi_base';
import config from '../config/pi_3.json';
import { PiMessage } from '../services/midi_server_api';
import { HueLight } from './hue_light';

export default class Pi extends PiBase implements PiHandler {
  private light = new HueLight('Pineapple');

  constructor() {
    super(config);
  }

  onMessage(data: PiMessage) {
    this.sendNote(24 + data.index);

    const hue = data.index / 11;
    this.light.setHue(hue);
  }
}
