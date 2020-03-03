import osc from 'osc-min';
import createSocket from '../shared/create_socket';

export class MadMapper {
  private socket;

  constructor(private name: string) {
    createSocket().then(socket => this.socket = socket);
  }

  async sendMessage(address: string, value = 1) {
    if (this.socket) {
      const message = osc.toBuffer({
        address: `${this.name}/${address}`,
        args: [value],
      })
      await this.send(message)
    }
  }

  private send(message) {
    this.socket.send(message, 0, message.length, 8010);
  }
}
