import { ConfigFile } from 'src/config/typings';
import { Output, getOutputs } from 'easymidi';
import { Subject } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import os from 'os';
import { MadMapper } from '../services/madmapper';

export class PiBase {
  private noteQueue = new Subject<number>();

  private output = this.getPlatformMidiOutput();

  protected madMapper = new MadMapper(this.config.controller.name);

  constructor(protected config: ConfigFile) {
    // Close the MIDI output when the app quits.
    process.on('SIGTERM', () => this.output.close());

    this.noteQueue.pipe(
        tap(note => this.sendNoteOn(note)),
        delay(10),
        tap(note => this.sendNoteOff(note)),
      ).subscribe();
  }

  protected sendFilter(controller: number, value: number) {
    this.output.send('cc', {
      controller,
      value,
      channel: 0,
    })
  }

  protected sendNote(note: number) {
    this.noteQueue.next(note);
  }

  private sendNoteOn(note: number) {
    this.output.send('noteon', {
      note,
      velocity: 127,
      channel: 0,
    });
  }

  private sendNoteOff(note: number) {
    this.output.send('noteoff', {
      note,
      velocity: 127,
      channel: 0,
    });
  }

  /**
   * Returns a virtual midi output for macs. Windows requires named loopMIDI
   * outputs created.
   * LoopMIDI adds an integer after the output names, so on Windows we'll loop
   * through to find a similarly named output to attatch to.
   */
  protected getPlatformMidiOutput() {
    if (os.platform() === 'darwin') {
      return new Output(this.config.controller.midiName, true);

    } else if (os.platform() === 'win32') {
      // Find an output that starts with the config name.
      const outputName = getOutputs().find((name: string) =>
          name.startsWith(this.config.controller.midiName));

      if (!outputName) {
        throw new Error('No loopMIDI named output found for ' +
            this.config.controller.midiName);
      }

      return new Output(outputName);

    } else {
      throw new Error('Untested platform.');
    }
  }
}

export interface PiHandler {
  onMessage(data: any): void;
}
