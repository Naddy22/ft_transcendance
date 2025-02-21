/**
 * Manage Live Game Sessions
 * - Stores active game sessions
 * - Tracks ball movement
 * - Cleans up inactive games
 */

import WebSocket from "ws";

interface Game {
    players: WebSocket[];
    ball: any;
}

export class GameState {
    static games = new Map<string, { players: WebSocket[], ball: any }>();

    static createGame(gameId: string) {
        this.games.set(gameId, { players: [], ball: { x: 450, y: 300, dx: 4, dy: 0 } });
    }

    static updateBallPosition(gameId: string, ballData: any) {
        let game = this.games.get(gameId);
        if (game) game.ball = ballData;
    }

    static deleteGame(gameId: string) {
        this.games.delete(gameId);
    }
}
