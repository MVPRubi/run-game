class ConnectSocket {
  inst: WebSocket | null = null;

  constructor() {}

  connect(url: string, protocol: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      if (!this.inst) {
        this.inst = new WebSocket(url, protocol);
      }

      const socket = this.inst;

      socket.onopen = (event) => {
        resolve(socket);
      };

      socket.onclose = () => {
        console.log("On close");
      };
    });
  }
  close() {
    this.inst.close();
    this.inst = null;
  }
}

export const connectSocket = new ConnectSocket();
