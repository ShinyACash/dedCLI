import inquirer from 'inquirer';
import chalk from 'chalk';
import money from './moneyManager.js';


class BlackjackGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.playerScore = 0;
        this.dealerScore = 0;
        this.initializeDeck();
    }

    initializeDeck() {
        const suits = ['♥', '♦', '♠', '♣'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.deck = [];
        for (const suit of suits) {
            for (const value of values) {
                this.deck.push({ suit, value });
            }
        }
        this.shuffleDeck();
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCard(hand) {
        hand.push(this.deck.pop());
    }

    calculateScore(hand) {
        let score = 0;
        let aces = 0;
        for (const card of hand) {
            if (['J', 'Q', 'K'].includes(card.value)) score += 10;
            else if (card.value === 'A') {
                score += 11;
                aces++;
            } else score += parseInt(card.value);
        }
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    }

    async play() {
        console.log(chalk.bold.gray('\n=== BLACKJACK ===\n'));
        console.log(chalk.green(`Current balance: $${money.getBalance()}`));

        // Get bet amount
        const { bet } = await inquirer.prompt({
            type: 'number',
            name: 'bet',
            message: 'Place your bet (min 10):',
            validate: input => {
                if (isNaN(input)) return 'Enter a number!';
                if (input < 10) return 'Minimum bet is 10!';
                if (input > money.getBalance()) return 'Not enough money!';
                return true;
            }
        });

        if (!money.deduct(bet)) {
            console.log(chalk.red('Insufficient funds!'));
            return false;
        }
        
        this.playerHand = [];
        this.dealerHand = [];

        this.dealCard(this.playerHand);
        this.dealCard(this.dealerHand);
        this.dealCard(this.playerHand);
        this.dealCard(this.dealerHand);

        this.playerScore = this.calculateScore(this.playerHand);
        this.dealerScore = this.calculateScore(this.dealerHand);

        console.log(chalk.bold('Dealer shows:'), this.displayCard(this.dealerHand[0]), '[Hidden]');
        console.log(chalk.bold('Your hand:'), ...this.playerHand.map(c => this.displayCard(c)), `(Score: ${this.playerScore})`);

        while (this.playerScore < 21) {
            const { action } = await inquirer.prompt({
                type: 'list',
                name: 'action',
                message: 'Hit or Stand?',
                choices: ['Hit', 'Stand'],
            });

            if (action === 'Hit') {
                this.dealCard(this.playerHand);
                this.playerScore = this.calculateScore(this.playerHand);
                console.log(chalk.bold('Your hand:'), ...this.playerHand.map(c => this.displayCard(c)), `(Score: ${this.playerScore})`);
                if (this.playerScore > 21) {
                    console.log(chalk.red('Bust! You lose.'));
                    return false;
                }
            } else {
                break;
            }
        }

        console.log(chalk.bold('\nDealer reveals:'), ...this.dealerHand.map(c => this.displayCard(c)), `(Score: ${this.dealerScore})`);
        while (this.dealerScore < 17) {
            this.dealCard(this.dealerHand);
            this.dealerScore = this.calculateScore(this.dealerHand);
            console.log(chalk.bold('Dealer draws:'), this.displayCard(this.dealerHand[this.dealerHand.length - 1]), `(Score: ${this.dealerScore})`);
        }

        if (this.dealerScore > 21) {
            console.log(chalk.green('Dealer busts! You win!'));
            const winnings = bet * (this.playerScore === 21 ? 2.5 : 2); // Blackjack pays 3:2
            money.add(winnings);
            console.log(chalk.green(`+$${winnings}! New balance: $${money.getBalance()}`));
            return true;
        } else if (this.playerScore > this.dealerScore) {
            console.log(chalk.green(`You win! ${this.playerScore} vs ${this.dealerScore}`));
            const winnings = bet * (this.playerScore === 21 ? 2.5 : 2); // Blackjack pays 3:2
            money.add(winnings);
            console.log(chalk.green(`+$${winnings}! New balance: $${money.getBalance()}`));
            return true;
        } else if (this.playerScore === this.dealerScore) {
            console.log(chalk.yellow('Push (tie)!'));
            return false;
        } else {
            console.log(chalk.red(`You lose! ${this.playerScore} vs ${this.dealerScore}`));
            console.log(chalk.red(`-$${bet}. Balance: $${money.getBalance()}`));
            return false;
        }
        
    }

    displayCard(card) {
        const color = card.suit === '♥' || card.suit === '♦' ? chalk.red : chalk.white;
        return color(`[${card.value}${card.suit}]`);
    }
}



export default async function () {
    let playAgain = true;
    const game = new BlackjackGame();
    while (playAgain) {
        await game.play();
        const result = await inquirer.prompt({
            type: 'confirm',
            name: 'playAgain',
            message: chalk.blue('Play another round?'),
            default: false
        });
        playAgain = result.playAgain;
        if (playAgain) {
            console.clear();
        }
    }
}