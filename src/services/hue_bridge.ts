import nodeHueApi from 'node-hue-api';
import { logger } from '@shared';
import hueConfig from '../config/hue.json';
import { shareReplay, map, mergeMap, tap, filter, retryWhen, delayWhen } from 'rxjs/operators';
import { Observable, from, of, combineLatest, iif, timer } from 'rxjs';
import convert from 'color-convert';

const v3 = nodeHueApi.v3;
const hueApi = v3.api;
const LightState = v3.lightStates.LightState;

const APP = 'interactive-room';
const DEVICE = 'server-control';

export declare interface IpSearchResult {
  ipaddress: string;
}

export declare interface HueUser {
  username: string;
  clientkey: string;
}

export class HueBridge {
  private lights = {}

  private ip$ = this.getIpAddress().pipe(shareReplay(1));
  private user$ = this.getUser().pipe(shareReplay(1));
  private api$ = this.getApi().pipe(shareReplay(1));

  /**
   * Set the RGB color of the light.
   *
   * @param name Name of the light - see app.
   * @param colors
   */
  public setLightColor(name: string, colors = [255, 255, 255]) {
    const hsb = convert.rgb.hsl(colors) as [number, number, number];

    const state = new LightState()
      .on(true)
      .hsl(...hsb);

    return this.setLightState(name, state);
  }

  /**
   * Immediately shift the hue of a light.
   * Value between 0 - 1.
   */
  public setHue(name: string, value: number) {
    const state = new LightState()
      .hue(value * 65535);

    return this.setLightState(name, state);
  }

  /** Sets the state of a light. */
  private setLightState(name: string, state) {
    return combineLatest(this.api$, this.getLightId(name)).pipe(
      mergeMap(res => res[0].lights.setLightState(res[1], state))
    );
  }

  /** Find the ID of a light. */
  private getLightId(name: string) {
    if (this.lights[name]) {
      return of(this.lights[name]);
    }

    return this.api$.pipe(
      mergeMap(api => api.lights.getLightByName(name)),
    );
  }

  /**
   * Finds the IP address of a Philips Hue Bridge on a local network.
   * PSA: You need to have at least one light on nearby of this to work.
   */
  private getIpAddress(): Observable<string> {
    return from(v3.discovery.nupnpSearch())
        .pipe(
          map(res => {
            const results = (res as IpSearchResult[]);
            if (results.length) {
              return (results as IpSearchResult[])[0].ipaddress;
            } else {
              throw new Error();
            }
          }),
          retryWhen(errors =>
            errors.pipe(
              tap(() => logger.log('error', `Can't Hue Bridge on network`)),
              delayWhen(() => timer(10000)),
            )
          ),
          // Add retryWhen
          shareReplay(1),
        );
  }

  /** Gets or create a user to control your lighting setup with. */
  private getUser(): Observable<HueUser|null> {
    if (hueConfig.user) {
      return of(hueConfig.user);
    }

    return this.ip$.pipe(
      mergeMap(ip =>
        iif(
          () => ip === null,
          of(null),
          of().pipe(
            mergeMap(() => from(hueApi.createLocal(ip as string).connect())),
            mergeMap(unauthedApi => from(unauthedApi.users.createUser(APP, DEVICE))),
            tap(user => {
              /**
               * TODO: Just automatically write this data to file. But why do we even
               * have to authenticate when literally anyone can create a new user.
               * Wtf is the point in this. FFS Philips let me do my shit already.
               */
              logger.log('info', 'New Hue Brudge user created.');
              logger.log('info', 'Store these credentials in the hue_config file');
              logger.log('info', JSON.stringify(user));
            }),
            map(user => user as HueUser),
            shareReplay(1),
          ),
        )
      ),
    );
  }

  /** Creates an API tunnel with the bridge. */
  private getApi() {
    return combineLatest(this.ip$, this.user$).pipe(
      filter(res => res[0] !== null && res[1] !== null),
      mergeMap(res => from(hueApi.createLocal(res[0] as string).connect((res[1] as HueUser).username))),
    );
  }
}

export const hueBridge = new HueBridge();
