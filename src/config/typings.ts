export declare interface ConfigFile {
  NODE_ENV: string;
  PORT: number;
  HOST: string;
  controller: ControllerConfig;
  server?: ServerConfig;
}

export declare interface ControllerConfig {
  name: string;
  type: string;
}

export declare interface ServerConfig {
  socketPort: number;
  expressPort: number;
  pingPath: string;
  ipAddress: string;
}
