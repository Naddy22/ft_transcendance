
const chatProtocol = window.location.protocol === "https:" ? "wss" : "ws";
const chatServer = `${chatProtocol}://${window.location.hostname}:8080/chat`;

export class Chat {
    private socket: WebSocket;

    constructor() {
        this.socket = new WebSocket(chatServer);
        this.socket.onmessage = (event) => this.displayMessage(event);
    }

    private displayMessage(event: MessageEvent) {
        const message = JSON.parse(event.data);
        document.getElementById("chat").innerHTML += `<p>${message.user}: ${message.text}</p>`;
    }

    public sendMessage(user: string, text: string) {
        this.socket.send(JSON.stringify({ user, text }));
    }
}
