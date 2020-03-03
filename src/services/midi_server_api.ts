import netList from 'network-list';
import { logger } from '@shared';
import io from 'socket.io-client';
import { serverConfig, config } from '../config';
import fetch from 'node-fetch';

/** Partial interface of the network-list device type. */
export declare interface NetworkDevice {
  ip: string;
  hostname: string|null;
  mac: string|null;
}

export enum TouchType {
  TOUCH = 'touch',
  RELEASE = 'release',
}

export declare interface PiMessage {
  id: string;
  index: number;
  type: TouchType;
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

export const DEBOUNCE_TIME = 10;

export class MidiServerApi {
  /** IP Address of the MIDI server. */
  private ipAddress: string;

  /** Is there a websocket connection to the MIDI server. */
  private isConnected = false;

  /** The socket connection. */
  private io: SocketIOClient.Socket;

  sendMessage(index: number, type: string) {
    if (this.isConnected) {
      this.send({
        id: config.controller.name,
        index,
        type,
      } as PiMessage);
    }
  }

  private send(message: any) {
    this.io.emit('midi', JSON.stringify(message));
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
  }

  connect(): Promise<void> {
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
    for (const device of devices) {
      const endpoint =
          `http://${device.ip}:${serverConfig.expressPort}${serverConfig.pingPath}`;

      try {
        const res = await fetch(endpoint, {timeout: 50});

        if (res.ok) {
          return device;
        }
      } catch(err) {
        logger.log('warn', 'No server found at ip: ' + device.ip);
      }
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
