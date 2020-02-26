import netList from 'network-list';
import isReachable from 'is-reachable';
import { logger } from '@shared';
import io from 'socket.io-client';
import { serverConfig } from '../config';

/** Partial interface of the network-list device type. */
export declare interface NetworkDevice {
  ip: string;
  hostname: string|null;
  mac: string|null;
}

/**
 * Add any known IPs here to search through. Useful when using multiple
 * development environments, devices, or networks.
 */
export const KNOWN_IPS: string[] = [
  serverConfig.ipAddress,
  '10.69.100.66',
];

/** Known MAC addresses to search through first. */
export const KNOWN_MACS: string[] = [];

/**
 * TODO: Reconnect if connection is lost.
 * TODO: Add dev mode delay when connecting.
 */
export class MidiServerApi {
  /** IP Address of the MIDI server. */
  private ipAddress: string;

  /** Is there a websocket connection to the MIDI server. */
  private isConnected = false;

  /** The socket connection. */
  private io: SocketIOClient.Socket;

  constructor(private pID: string) {}

  /** TODO: throttle so no one can overload the server. */
  sendMessage(index: number, type: string) {
    if (this.isConnected) {
      this.io.emit('midi', JSON.stringify({
        id: this.pID,
        index,
        type,
      }));
    }
  }

  /**
   * Searches the current network for a MIDI server that was run using:
   * $ npm run start:dev:server
   */
  async findMidiServer(): Promise<void> {
    logger.log('info', 'Searching for known MIDI servers.');
    const knownDevices = this.getDevicesOfKnownIps();
    const knownDevice = await this.findReachableServer(knownDevices);

    if (knownDevice) {
      logger.log('info', `Found known MIDI server at: ${knownDevice.ip}`);
      this.ipAddress = knownDevice.ip;
    } else {
      logger.log('warn', 'Known server not found.');
      logger.log('info', 'Scanning network for MIDI server');
      const devices = await this.scanNetwork();

      logger.log('info', 'Pinging connected devices');
      const device = await this.findReachableServer(devices);

      if (device) {
        logger.log('info', `Found MIDI server at: ${device.ip}`);
        this.ipAddress = device.ip;
      } else {
        logger.log('error', 'No MIDI server found on network.');
        throw new Error('No MIDI server found on network.');
      }
    }

    await this.connect();
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      logger.log('info', 'Connecting to MIDI server');
      this.io = io(`http://${this.ipAddress}:${serverConfig.socketPort}`);

      this.io.on('connect', socket => {
        logger.log('info', 'Connected to MIDI server');
        this.isConnected = true;
        resolve();
      });

      this.io.on('disconnect', () => {
        logger.log('error', 'Lost connection to MIDI server');
        this.isConnected = false;
      });

      this.io.once('connect_error', () => {
        reject(new Error('connect_error'));
      });

      this.io.once('connect_timeout', () => {
        reject(new Error('connect_timeout'));
      });
    });
  }

  /** Pings a list of devices for a successful response. */
  private async findReachableServer(devices: NetworkDevice[]): Promise<NetworkDevice|void> {
    try {
      for (const device of devices) {
        const enpoint =
            `${device.ip}:${serverConfig.expressPort}${serverConfig.pingPath}`;
        const foundServer = await isReachable(enpoint);
        if (foundServer) {
          return device;
        }
      }
    } catch (err) {
      throw new Error('No server found');
    }
  }

  /** Returns a list of all connected devices on the network. */
  private scanNetwork(): Promise<NetworkDevice[]> {
    return new Promise((resolve, reject) => {
      netList.scan({}, (err: Error, arr: NetworkDevice[]) => {
        if (!err) {
          const devices = this.sortDevicesByKnown(arr);
          resolve(devices);
        } else {
          reject([]);
        }
      });
    });
  }

  /** Sorts a list of devices by the known IPs and MAC addresses. */
  private sortDevicesByKnown(devices: NetworkDevice[]): NetworkDevice[] {
    return devices.reduce((acc, device) => {
      if (KNOWN_IPS.includes(device.ip) || device.mac && KNOWN_MACS.includes(device.mac)) {
        return [device, ...acc];
      }

      return [...acc, device];
    }, [] as NetworkDevice[]);
  }

  private getDevicesOfKnownIps(): NetworkDevice[] {
    return KNOWN_IPS.map(ip => ({
      ip,
      hostname: null,
      mac: null,
    }));
  }
}
