import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';

const historyPath = path.resolve('clipboard_history.json');
const MAX_ENTRIES = 50;

function loadHistory() {
    if (!fs.existsSync(historyPath)) return [];
    try {
        return JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch {
        return [];
    }
}

function saveHistory(history) {
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');
}

function getClipboard() {
    try {
        const result = execSync('powershell -NoProfile -Command "Get-Clipboard"', {
            encoding: 'utf8',
            timeout: 2000,
            stdio: ['pipe', 'pipe', 'ignore']
        });
        return result.trim() || null;
    } catch {
        return null;
    }
}

function setClipboard(text) {
    // Escape single quotes for PowerShell
    const escaped = text.replace(/'/g, "''");
    execSync(`powershell -NoProfile -Command "Set-Clipboard -Value '${escaped}'"`, {
        timeout: 2000,
        stdio: 'ignore'
    });
}

async function watchClipboard() {
    console.clear();
    console.log(chalk.bold.cyan('\n  Clipboard Watcher\n'));
    console.log(chalk.gray('  Watching for 2 minutes. Press ') + chalk.yellow('q') + chalk.gray(' + Enter to stop early.\n'));

    const history = loadHistory();
    let lastEntry = getClipboard();
    let captured = 0;
    let stopped = false;
    const WATCH_SECONDS = 120;

    // Key listener to stop early
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.on('line', (line) => {
        if (line.trim().toLowerCase() === 'q') stopped = true;
    });

    await new Promise((resolve) => {
        let elapsed = 0;
        const interval = setInterval(() => {
            elapsed++;
            const remaining = WATCH_SECONDS - elapsed;
            const current = getClipboard();

            if (current && current !== lastEntry) {
                lastEntry = current;
                // Deduplicate: don't add if already top of history
                if (history[0] !== current) {
                    history.unshift(current);
                    if (history.length > MAX_ENTRIES) history.pop();
                    saveHistory(history);
                    captured++;
                    const preview = current.length > 60 ? current.slice(0, 57) + '...' : current;
                    process.stdout.write(`\r  + Captured: ${chalk.white(preview.replace(/\n/g, '|'))}${''.padEnd(20)}\n`);
                }
            }

            process.stdout.write(
                `\r  [watch] ${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')} remaining — ${chalk.yellow(captured)} new entr${captured === 1 ? 'y' : 'ies'} captured   `
            );

            if (stopped || remaining <= 0) {
                clearInterval(interval);
                resolve();
            }
        }, 1000);
    });

    rl.close();
    process.stdin.resume(); // restore stdin for inquirer after readline takes ownership
    process.stdout.write('\n');
    console.log(chalk.green(`\n  Done! Captured ${captured} entr${captured === 1 ? 'y' : 'ies'}.\n`));
    await new Promise(r => setTimeout(r, 1500));
}

async function browseHistory() {
    console.clear();
    const history = loadHistory();

    if (history.length === 0) {
        console.log(chalk.yellow('\n  No clipboard history yet. Start watching first.\n'));
        await new Promise(r => setTimeout(r, 2000));
        return;
    }

    console.log(chalk.bold.cyan('\n  Clipboard History\n'));

    const choices = history.map((entry, i) => {
        const preview = entry.replace(/\n/g, '↵').slice(0, 70);
        return {
            name: `${chalk.gray(`[${i + 1}]`)} ${preview}${entry.length > 70 ? chalk.gray('…') : ''}`,
            value: entry
        };
    });
    choices.push(new inquirer.Separator());
    choices.push({ name: chalk.gray('← Back'), value: '__back__' });

    const { selected } = await inquirer.prompt({
        name: 'selected',
        type: 'list',
        message: 'Select an entry to copy it back to your clipboard:',
        choices,
        pageSize: 15,
    });

    if (selected === '__back__') return;

    setClipboard(selected);
    const preview = selected.length > 60 ? selected.slice(0, 57) + '...' : selected;
    console.log(chalk.green(`\n  Copied to clipboard: `) + chalk.white(preview.replace(/\n/g, '|')) + '\n');
    await new Promise(r => setTimeout(r, 2000));
}

async function clearHistory() {
    const { confirm } = await inquirer.prompt({
        name: 'confirm',
        type: 'confirm',
        message: chalk.red('Clear ALL clipboard history?'),
        default: false,
    });

    if (confirm) {
        saveHistory([]);
        console.log(chalk.green('\n  History cleared.\n'));
        await new Promise(r => setTimeout(r, 1500));
    }
}

export default async function clipboardHistory() {
    while (true) {
        console.clear();
        const history = loadHistory();
        console.log(chalk.bold.cyan('\n  Clipboard History\n'));
        console.log(chalk.gray(`  ${history.length} entr${history.length === 1 ? 'y' : 'ies'} stored\n`));

        const { action } = await inquirer.prompt({
            name: 'action',
            type: 'list',
            message: 'What do you want to do?',
            choices: [
                { name: 'Watch clipboard (capture new copies)', value: 'watch' },
                { name: 'Browse & restore an entry', value: 'browse' },
                { name: 'Clear history', value: 'clear' },
                new inquirer.Separator(),
                { name: '<- Back to Main Menu', value: 'back' },
            ],
        });

        if (action === 'back') { console.clear(); return; }
        if (action === 'watch') await watchClipboard();
        if (action === 'browse') await browseHistory();
        if (action === 'clear') await clearHistory();
    }
}
