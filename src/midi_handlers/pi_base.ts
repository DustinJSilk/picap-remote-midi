import { ConfigFile } from 'src/config/typings';
import { Output } from 'easymidi';
import { Subject, from } from 'rxjs';
import { map, delay, mergeMap, tap } from 'rxjs/operators';

export class PiBase {
  protected output = new Output(this.config.controller.midiName, true);

  private noteQueue = new Subject<number>();

  constructor(private config: ConfigFile) {
    // Close the MIDI output when the app quits.
    process.on('SIGTERM', () => this.output.close());

    this.noteQueue.pipe(
        mergeMap(note => from(() => this.sendNoteOn(note))),
        tap(() => console.log('Pre delay')),
        delay(50),
        tap(() => console.log('Post delay')),
        map((note: number) => this.sendNoteOff(note)),
      ).subscribe();
  }

  protected queueNote(note: number) {
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
