export class GameState {
    backToBed: boolean;
    playerWasCaught: boolean;

    constructor() {
        this.reset();
    }

    reset(): void {
        this.backToBed = false;
        this.playerWasCaught = false;
    }

    doStartNextRound(): boolean {
        return this.backToBed;
    }

    doRestartGame(): boolean {
        return this.playerWasCaught;
    }

    isGameOver(): boolean {
        return this.backToBed || this.playerWasCaught;
    }
}