import { MidiServerApi, TouchType } from 'src/services/midi_server_api';
import { logger } from '@shared';
import { fork } from 'child_process';
import path from 'path';
import os from 'os';

export class PiController {
  private midiServer = new MidiServerApi();

  constructor() {
    logger.log('info', 'Starting pi controller');

    this.midiServer.findMidiServer();
    this.launchTouchControllerProcess();
  }

  /** Event when a touch is registered. */
  private onTouch(index: number, type: TouchType) {
    this.midiServer.sendMessage(index, type);
  }

  /**
   * Launches a child process that runs Node v9 to handle the touch board which
   * isn't supported in modern versions of node.
   *
   * TODO: Launch again if it ever crashes.
   */
  private launchTouchControllerProcess() {
    const execPath = path.resolve(os.homedir(), '.nvm/versions/node/v6.7.0/bin/node');

    const child = fork('./../subprocess_touch/index.js', [], {
      execPath,
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

  /** JSONify touch messages from the subprocess. */
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
