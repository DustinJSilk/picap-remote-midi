import { PiBase, PiHandler } from './pi_base';
import config from '../config/pi_3.json';
import { PiMessage, TouchType } from '../services/midi_server_api';
import { HueLight } from './hue_light';

/** The MIDI controller ID. */
const FILTER_CONTROLLER_ID = 0;

export default class Pi extends PiBase implements PiHandler {
  private light = new HueLight('Swipe');

  /** Map toouch points from top to bottom. */
  private map = [0, 1, 11, 3, 6, 5, 7, 8, 9, 10];

  constructor() {
    super(config);
  }

  onMessage(data: PiMessage) {
    if (data.type === TouchType.TOUCH) {
      const value = this.map.indexOf(data.index) / this.map.length * 127;

      this.sendFilter(FILTER_CONTROLLER_ID, value);

      const hue = data.index / 11;
      this.light.setHue(hue);
    }
  }
}
