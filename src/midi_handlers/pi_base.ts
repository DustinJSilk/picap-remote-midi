import { ConfigFile } from 'src/config/typings';
import { Output } from 'easymidi';
import { Subject } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export class PiBase {
  protected output = new Output(this.config.controller.midiName, true);

  private noteQueue = new Subject<number>();

  constructor(protected config: ConfigFile) {
    // Close the MIDI output when the app quits.
    process.on('SIGTERM', () => this.output.close());

    this.noteQueue.pipe(
        tap(note => this.sendNoteOn(note)),
        delay(10),
        tap(note => this.sendNoteOff(note)),
      ).subscribe();
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
}

export interface PiHandler {
  onMessage(data: any): void;
}
