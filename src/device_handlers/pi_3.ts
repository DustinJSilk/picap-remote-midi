import { PiBase, PiHandler } from './pi_base';
import config from '../config/pi_3.json';
import { PiMessage, TouchType } from '../services/midi_server_api';
import { HueLight } from './hue_light';
import { Subject } from 'rxjs';
import { tap, debounceTime } from 'rxjs/operators';

/** The MIDI controller ID. */
const FILTER_CONTROLLER_ID = 0;

/** The lowest value for the filter. */
const FILTER_BOTTOM = 50;

/** The highest value for the filter. */
const FILTER_TOP = 127;

export default class Pi extends PiBase implements PiHandler {
  private light = new HueLight('Swipe');

  /** Map touch points from top to bottom. */
  private map = [0, 1, 11, 3, 6, 5, 7, 8, 9, 10];

  private updateFilter$ = new Subject<number>();

  constructor() {
    super(config);

    this.updateFilter$.pipe(
      // Send filter value
      tap(value => this.sendFilter(FILTER_CONTROLLER_ID, value)),

      // Wait until values stop emitting for 1.5s
      debounceTime(1500),

      // Reset filter to zero
      tap(() => this.sendFilter(FILTER_CONTROLLER_ID, 0)),
      ).subscribe();
  }

  onMessage(data: PiMessage) {
    if (data.type === TouchType.TOUCH) {
      // Get the filter value
      const touchIndex = this.map.indexOf(data.index);
      const value = this.squashValue(touchIndex);

      // Send MIDI filter message
      this.updateFilter$.next(value);

      // Update hue strip
      const hue = touchIndex / this.map.length;
      this.light.setHue(hue);
    }
  }

  private squashValue(value: number): number {
    const range = FILTER_TOP - FILTER_BOTTOM;
    return value / this.map.length * range + FILTER_BOTTOM;
  }
}
