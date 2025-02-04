
const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const serverAddress = `${protocol}://${window.location.hostname}:8080`;

export class Multiplayer {
    private socket: WebSocket;

    constructor() {
        this.socket = new WebSocket(serverAddress);
        this.socket.onopen = () => console.log("Connected to server");
        this.socket.onmessage = (event) => this.handleMessage(event);
    }

    private handleMessage(event: MessageEvent) {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);
    }

    public syncState(gameState: any) {
        this.socket.send(JSON.stringify(gameState));
    }
}
