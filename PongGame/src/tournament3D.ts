import { startPongGame3D, stopPongGame3D } from './game3D.js';

export class Tournament {
	players: string[];
	matches: { player1: string; player2: string; winner?: string }[];
	currentMatchIndex: number;

	constructor(playerNames: string[]) {
		this.players = playerNames;
		this.matches = [];
		this.currentMatchIndex = 0;
		this.initializeTournament();
	}

	initializeTournament(): void {
		const numPlayers = this.players.length;
		for (let i = 0; i < numPlayers; i += 2) {
			this.matches.push({ player1: this.players[i], player2: this.players[i + 1] });
		}
	}

	getCurrentMatch(): { player1: string; player2: string } | null {
		if (this.currentMatchIndex >= this.matches.length) return null;
		return this.matches[this.currentMatchIndex];
	}

	setMatchWinner(winner: string): void {
		if (this.currentMatchIndex < this.matches.length) {
			this.matches[this.currentMatchIndex].winner = winner;
			this.currentMatchIndex++;
			if (this.currentMatchIndex === this.matches.length && this.matches.length > 1) {
				const winners = this.matches.map(match => match.winner!).filter(w => w);
				this.matches = [];
				this.currentMatchIndex = 0;
				for (let i = 0; i < winners.length; i += 2) {
					this.matches.push({ player1: winners[i], player2: winners[i + 1] });
				}
			}
		}
	}

	isTournamentOver(): boolean {
		return this.matches.length === 1 && this.currentMatchIndex === 1;
	}

	getWinner(): string | null {
		return this.isTournamentOver() ? this.matches[0].winner! : null;
	}

	start(callback: (winner: string) => void): void {
		const playNextMatch = () => {
			const currentMatch = this.getCurrentMatch();
			if (!currentMatch) {
				console.log("Tournoi terminé ! Gagnant :", this.getWinner());
				callback(this.getWinner()!); // Informe du gagnant final
				return;
			}

			console.log(`Match : ${currentMatch.player1} vs ${currentMatch.player2}`);
			startPongGame3D(currentMatch.player1, currentMatch.player2, (winner) => {
				stopPongGame3D();
				this.setMatchWinner(winner);
				callback(winner);
				playNextMatch();
			});
		};

		playNextMatch();
	}
}