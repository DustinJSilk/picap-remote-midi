import { PiBase, PiHandler } from './pi_base';
import config from '../config/pi_1.json';
import { PiMessage, TouchType } from '../services/midi_server_api';
import { HueLight } from './hue_light';

export default class Pi extends PiBase implements PiHandler {
  private light = new HueLight('Spot');

  private drums = [
    [9, 10, 11],
    [8, 6, 7],
  ];

  constructor() {
    super(config);
  }

  onMessage(data: PiMessage) {
    if (data.type === TouchType.TOUCH) {
      // Send midi note
      this.sendNote(data.index);

      // Send OSC message. Turn off all animations in row and turn on new item.
      const row = this.drums.find(r => r.includes(data.index));

      if (row) {
        row.forEach(item => this.madMapper.sendMessage(`${item}`, 0));
        this.madMapper.sendMessage(`${data.index}`, 1);
      }

      // Send Philips Hue lights message
      const hue = data.index / 11;
      this.light.setHue(hue);
    }
  }
}
