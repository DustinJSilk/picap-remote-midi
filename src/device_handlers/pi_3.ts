import { PiBase, PiHandler } from './pi_base';
import config from '../config/pi_3.json';
import { PiMessage } from '../services/midi_server_api';
import { HueLight } from './hue_light';

export default class Pi extends PiBase implements PiHandler {
  private light = new HueLight('Swipe');

  /** Map toouch points from top to bottom. */
  private map = [0, 1, 11, 3, 6, 5, 7, 8, 9, 10];

  constructor() {
    super(config);
  }

  onMessage(data: PiMessage) {
    const value = this.map.indexOf(data.index) / this.map.length * 127;

    this.sendFilter(0, value);

    const hue = data.index / 11;
    this.light.setHue(hue);
  }
}
