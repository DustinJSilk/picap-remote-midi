import commandLineArgs from 'command-line-args';
import { ConfigFile, ServerConfig } from './typings';

// Setup command line options
const options = commandLineArgs([
  {
    name: 'config_file',
    alias: 'c',
    defaultValue: 'midi_server',
    type: String,
  },
]);

/** Import the config file for the current command argument */
const config = require(`./${options.config_file}.json`) as ConfigFile;

/**
 * Import the config file for the midi_server so that the PIs know what ports
 * to use.
 */
const midiConfig = options.config_file === 'midi_server' ?
    config : require(`./midi_server.json`) as ConfigFile;

const serverConfig = midiConfig.server as ServerConfig;

export default config;
export { config, serverConfig }
