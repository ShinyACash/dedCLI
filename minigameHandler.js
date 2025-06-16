import { createSpinner } from 'nanospinner';
import inquirer from 'inquirer';
import chalk from 'chalk';
import money from './moneyManager.js';
import blackjack from './blackjack.js';


export default async function minigameHandler() {
    while (true) {
        console.clear();
        console.log(chalk.bold.magenta('\n=== MINIGAME VAULT ===\n\n'));
        console.log(chalk.yellow(`Current balance: $${money.getBalance()}\n`));
        console.log('More games to come with future updates!\n');

        const { game } = await inquirer.prompt({
            name: 'game',
            type: 'list',
            message: 'Ch00se y0ur sh1t:',
            choices: [
                'Blackjack (we love gambling!)',
                new inquirer.Separator(),
                'Return to Main Menu'
            ],
        });

        if (game == 'Return to Main Menu') {
            console.clear();
            return;
        }

        const spinner = createSpinner(`Launching ${game}...`).start();
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            spinner.stop();
            console.clear();

            switch (game) {
                case 'Blackjack (we love gambling!)':
                    await blackjack();
                    break;
            }
        } catch (err) {
            spinner.error({ text: `Error: ${err.message}` });
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }
}