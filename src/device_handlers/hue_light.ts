import { hueBridge } from '../services/hue_bridge';

/**
 * Handler to control a set of predefined Philips Hue lights through a Bridge.
 */
export class HueLight {
  private hueBridge = hueBridge;

  constructor(private name: string) {}

  setColor(color: [number, number, number]) {
    this.hueBridge.setLightColor(this.name, color).subscribe();
  }

  setHue(value: number) {
    this.hueBridge.setHue(this.name, value).subscribe();
  }
}
