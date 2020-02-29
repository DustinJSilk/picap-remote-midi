import osc from 'osc-min';
import createSocket from '../shared/create_socket';

export class MadMapper {
  private socket;

  constructor() {
    createSocket().then(socket => this.socket = socket);
  }

  async sendMessage(name: string, ) {
    if (this.socket) {
      const val = Math.floor(Math.random() * 2);
      const message = osc.toBuffer({
        address: '/testing',
        args: [val],
      })
      await this.send(message)
    }
  }

  private send(message) {
    this.socket.send(message, 0, message.length, 8010);
  }
}
