import { PiBase, PiHandler } from './pi_base';
import config from '../config/pi_4.json';
import { PiMessage } from '../services/midi_server_api';
import { HueLight } from './hue_light';

/** The range of random MIDI notes to fire when touched. */
const RANDOM_NOTE_RANGE = 4;

/** How much should the lights hue change when touched. */
const HUE_CHANGE_DISTANCE = .3;

export default class Pi extends PiBase implements PiHandler {
  private light = new HueLight('Fruit');

  private lastHue  = this.getRandomHue();

  constructor() {
    super(config);

    // Set initial; random hue
    this.light.setHue(this.lastHue);
  }

  onMessage(data: PiMessage) {
    const note = Math.floor(Math.random() * RANDOM_NOTE_RANGE);
    this.sendNote(36 + note);

    // Set random hue
    const hue = this.getNextHueValue();
    this.light.setHue(hue);
  }

  /**
   * Returns a random hue value that is a noticible change to the previous hue
   * value.
   */
  private getNextHueValue(): number {
    let hue = this.getRandomHue();

    // Simply keep trying until a value is produced with a great enough distance
    while (Math.abs(hue - this.lastHue) < HUE_CHANGE_DISTANCE) {
      hue = this.getRandomHue();
    }

    this.lastHue = hue;
    return hue;
  }

  /** Returns a random hue value excluding the last red range: 8%. */
  private getRandomHue(): number {
    return Math.random() * 0.92;
  }
}
