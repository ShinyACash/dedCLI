import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

const logPath = path.resolve('log.txt');

function readLogEntries() {
    if (!fs.existsSync(logPath)) return [];

    const raw = fs.readFileSync(logPath, 'utf8');
    const lines = raw.split('\n').filter(l => l.trim() !== '');

    return lines.map(line => {
        const match = line.match(/^\[(.+?)\]\s(.+)$/s);
        if (match) {
            return { timestamp: match[1], message: match[2], raw: line };
        }
        return { timestamp: null, message: line, raw: line };
    });
}

function formatEntry(entry, index) {
    const num = chalk.gray(`[${String(index + 1).padStart(3, '0')}]`);
    if (entry.timestamp) {
        const date = new Date(entry.timestamp);
        const dateStr = chalk.cyan(date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }));
        const timeStr = chalk.magenta(date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        return `${num} ${dateStr} ${timeStr} — ${chalk.white(entry.message)}`;
    }
    return `${num} ${chalk.white(entry.raw)}`;
}

async function viewAll(entries) {
    console.clear();
    console.log(chalk.bold.cyan('\n  All Log Entries\n'));

    if (entries.length === 0) {
        console.log(chalk.yellow('  Log is empty. Nothing to show.\n'));
        await new Promise(r => setTimeout(r, 2000));
        return;
    }

    // Page them — show in batches of 20
    const PAGE_SIZE = 20;
    let page = 0;

    while (true) {
        console.clear();
        const total = entries.length;
        const totalPages = Math.ceil(total / PAGE_SIZE);
        const start = page * PAGE_SIZE;
        const slice = entries.slice(start, start + PAGE_SIZE);

        console.log(chalk.bold.cyan(`\n  Log Entries — Page ${page + 1}/${totalPages} (${total} total)\n`));
        slice.forEach((entry, i) => console.log('  ' + formatEntry(entry, start + i)));
        console.log();

        const navChoices = [];
        if (page > 0) navChoices.push({ name: '← Previous page', value: 'prev' });
        if (page < totalPages - 1) navChoices.push({ name: 'Next page →', value: 'next' });
        navChoices.push({ name: '← Back', value: 'back' });

        const { nav } = await inquirer.prompt({
            name: 'nav',
            type: 'list',
            message: 'Navigate:',
            choices: navChoices,
        });

        if (nav === 'next') page++;
        else if (nav === 'prev') page--;
        else break;
    }
}

async function filterByKeyword(entries) {
    console.clear();
    console.log(chalk.bold.cyan('\n  Filter by Keyword\n'));

    const { keyword } = await inquirer.prompt({
        name: 'keyword',
        type: 'input',
        message: 'Enter keyword to search:',
        validate: input => input.trim() !== '' || 'Enter something to search for',
    });

    const kw = keyword.trim().toLowerCase();
    const results = entries.filter(e => e.raw.toLowerCase().includes(kw));

    console.clear();
    console.log(chalk.bold.cyan(`\n  Results for "${chalk.yellow(keyword)}"\n`));

    if (results.length === 0) {
        console.log(chalk.yellow('  No matching entries found.\n'));
        await new Promise(r => setTimeout(r, 2000));
        return;
    }

    results.forEach((entry, i) => {
        // Highlight keyword in message
        const highlighted = entry.raw.replace(
            new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
            match => chalk.bgYellow.black(match)
        );
        console.log(chalk.gray(`  [${String(i + 1).padStart(3, '0')}]`) + ' ' + chalk.white(highlighted));
    });

    console.log(chalk.gray(`\n  ${results.length} result${results.length === 1 ? '' : 's'} found.\n`));
    await inquirer.prompt({ name: '_', type: 'input', message: 'Press Enter to go back...' });
}

async function filterByDate(entries) {
    console.clear();
    console.log(chalk.bold.cyan('\n  Filter by Date\n'));

    const { dateInput } = await inquirer.prompt({
        name: 'dateInput',
        type: 'input',
        message: 'Enter date (YYYY-MM-DD):',
        validate: input => /^\d{4}-\d{2}-\d{2}$/.test(input.trim()) || 'Use format YYYY-MM-DD',
    });

    const targetDate = dateInput.trim();
    const results = entries.filter(e => e.timestamp && e.timestamp.startsWith(targetDate));

    console.clear();
    console.log(chalk.bold.cyan(`\n  Entries for ${chalk.yellow(targetDate)}\n`));

    if (results.length === 0) {
        console.log(chalk.yellow('  No entries found for that date.\n'));
        await new Promise(r => setTimeout(r, 2000));
        return;
    }

    results.forEach((entry, i) => console.log('  ' + formatEntry(entry, i)));
    console.log(chalk.gray(`\n  ${results.length} entr${results.length === 1 ? 'y' : 'ies'} found.\n`));
    await inquirer.prompt({ name: '_', type: 'input', message: 'Press Enter to go back...' });
}

async function clearLog() {
    const { confirm } = await inquirer.prompt({
        name: 'confirm',
        type: 'confirm',
        message: chalk.red('Clear the ENTIRE log? This cannot be undone.'),
        default: false,
    });

    if (confirm) {
        fs.writeFileSync(logPath, '', 'utf8');
        console.log(chalk.green('\n  Log cleared.\n'));
        await new Promise(r => setTimeout(r, 1500));
    }
}

export default async function logViewer() {
    while (true) {
        console.clear();
        const entries = readLogEntries();
        const size = fs.existsSync(logPath) ? (fs.statSync(logPath).size / 1024).toFixed(1) : '0.0';

        console.log(chalk.bold.cyan('\n  Log Viewer\n'));
        console.log(chalk.gray(`  ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} · ${size} KB\n`));

        const { action } = await inquirer.prompt({
            name: 'action',
            type: 'list',
            message: 'What do you want to do?',
            choices: [
                { name: 'View all entries', value: 'all' },
                { name: 'Filter by keyword', value: 'keyword' },
                { name: 'Filter by date', value: 'date' },
                { name: 'Clear log', value: 'clear' },
                new inquirer.Separator(),
                { name: '<- Back to Main Menu', value: 'back' },
            ],
        });

        if (action === 'back') { console.clear(); return; }

        const freshEntries = readLogEntries(); // re-read in case it changed
        if (action === 'all') await viewAll(freshEntries);
        else if (action === 'keyword') await filterByKeyword(freshEntries);
        else if (action === 'date') await filterByDate(freshEntries);
        else if (action === 'clear') await clearLog();
    }
}
