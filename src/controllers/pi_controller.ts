import { MidiServerApi } from 'src/services/midi_server_api';
import { logger } from '@shared';
import { fork } from 'child_process';

export enum TouchType {
  TOUCH = 'touch',
  RELEASE = 'release',
}

export class PiController {
  private midiServer = new MidiServerApi('pi_1');

  constructor() {
    logger.log('info', 'Starting pi controller');

    this.midiServer.findMidiServer();

    /** TODO: Launch again if it ever crashes. */
    const child = fork('../subprocess_touch/index.js', [], {
      execPath : '/home/pi/.nvm/versions/node/v6.7.0/bin/node',
      cwd: __dirname,
      silent: true,
    });

    if (child.stdout) {
      child.stdout.on('data', message => {
        const data = this.processTouchMessage(message);
        if (data) {
          this.onTouch(data.i, data.t);
        }
      });
    }
  }

  private onTouch(index: number, type: TouchType) {
    this.midiServer.sendMessage(index, type);
  }

  private processTouchMessage(message: string): {i: number, t: TouchType}|null {
    try {
      const data = JSON.parse(message);
      return {
        i: Number(data.index),
        t: data.type,
      }
    } catch(err) {
      return null;
    }
  }
}
