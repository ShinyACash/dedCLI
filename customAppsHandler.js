import inquirer from 'inquirer';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { existsSync } from 'fs';

const customAppsPath = path.resolve('customApps.json');

function loadCustomApps() {
    if (!existsSync(customAppsPath)) {
        return {};
    }
    try {
        const data = fs.readFileSync(customAppsPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(chalk.red('Error loading custom apps:'), err);
        return {};
    }
}

function saveCustomApps(apps) {
    try {
        fs.writeFileSync(customAppsPath, JSON.stringify(apps, null, 2), 'utf8');
    } catch (err) {
        console.error(chalk.red('Error saving custom apps:'), err);
    }
}

async function openApp(appPath, appName) {
    const spinner = createSpinner(`Opening ${appName}...`).start();
    exec(`start "" "${appPath}"`, (error) => {
        if (error) {
            spinner.error({ text: `Failed to open ${appName}: ${error.message}` });
        } else {
            spinner.success({ text: `Opened ${appName}` });
        }
    });
}

export default async function customAppsHandler() {
    while (true) {
        console.clear();
        console.log(chalk.bold.magenta('\n=== Custom Apps ===\n'));

        const apps = loadCustomApps();
        const appNames = Object.keys(apps);

        const choices = [
            'Add Custom App',
            'Delete Custom App',
            new inquirer.Separator(),
            ...(appNames.length > 0 ? ['Open Custom App'] : []),
            new inquirer.Separator(),
            'Back to Main Menu'
        ];

        const { action } = await inquirer.prompt({
            name: 'action',
            type: 'list',
            message: 'What would you like to do?',
            choices: choices,
        });

        if (action === 'Back to Main Menu') {
            console.clear();
            return;
        }

        if (action === 'Add Custom App') {
            const { name } = await inquirer.prompt({
                name: 'name',
                type: 'input',
                message: 'Enter the name of the app:',
                validate: (input) => input.trim() !== '' || 'Name cannot be empty'
            });

            const { appPath } = await inquirer.prompt({
                name: 'appPath',
                type: 'input',
                message: 'Enter the full path to the app executable:',
                validate: (input) => input.trim() !== '' || 'Path cannot be empty'
            });

            apps[name.trim()] = appPath.trim();
            saveCustomApps(apps);
            console.log(chalk.green(`Added ${name} to custom apps.`));
            await new Promise(resolve => setTimeout(resolve, 1500));

        } else if (action === 'Delete Custom App') {
            if (appNames.length === 0) {
                console.log(chalk.yellow('No custom apps to delete.'));
                await new Promise(resolve => setTimeout(resolve, 1500));
                continue;
            }

            const { name } = await inquirer.prompt({
                name: 'name',
                type: 'list',
                message: 'Select the app to delete:',
                choices: appNames,
            });

            delete apps[name];
            saveCustomApps(apps);
            console.log(chalk.green(`Deleted ${name} from custom apps.`));
            await new Promise(resolve => setTimeout(resolve, 1500));

        } else if (action === 'Open Custom App') {
            const { name } = await inquirer.prompt({
                name: 'name',
                type: 'list',
                message: 'Select the app to open:',
                choices: appNames,
            });

            const appPath = apps[name];
            await openApp(appPath, name);
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }
}