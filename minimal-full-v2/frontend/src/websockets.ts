import { updateGame } from "./game";

const socket = new WebSocket("ws://localhost:8081");

socket.onopen = () => console.log("Connected to WebSocket Server");

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "update") {
        updateGame(data);
    } else if (data.type === "paddle") {
        if (data.player === 1) paddle1.y = data.y;
        else paddle2.y = data.y;
    }
};

export function sendPaddlePosition(player: number, y: number) {
    socket.send(JSON.stringify({ type: "paddle", player, y }));
}
