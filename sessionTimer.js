import inquirer from 'inquirer';
import chalk from 'chalk';
import { execSync } from 'child_process';

// Draw a big block-font time display using simple ASCII blocks
// Play a sequence of notes in one PowerShell call (no process-startup gap between notes)
function playTune(notes) {
    try {
        const cmd = notes
            .map(n => `[console]::beep(${n.freq}, ${n.dur})`)
            .join('; ');
        const total = notes.reduce((s, n) => s + n.dur, 0);
        execSync(`powershell -NoProfile -Command "${cmd}"`, {
            stdio: 'ignore',
            timeout: total + 2000
        });
    } catch {
        // silently ignore
    }
}

// Note frequencies (Hz)
const NOTE = {
    C4: 262, D4: 294, E4: 330, F4: 349,
    G4: 392, A4: 440, B4: 494,
    C5: 523, D5: 587, E5: 659, F5: 698,
    G5: 784, A5: 880
};

// Three tunes — one per event
const TUNES = {
    // Work session done -> break time: calm descending, like a wind-down
    workDone: [
        { freq: NOTE.E5, dur: 180 },
        { freq: NOTE.C5, dur: 180 },
        { freq: NOTE.G4, dur: 450 },
    ],
    // Break done -> back to work: ascending, punchy
    breakDone: [
        { freq: NOTE.G4, dur: 120 },
        { freq: NOTE.C5, dur: 120 },
        { freq: NOTE.E5, dur: 120 },
        { freq: NOTE.G5, dur: 380 },
    ],
    // All cycles finished: short victory fanfare
    allDone: [
        { freq: NOTE.C5, dur: 120 },
        { freq: NOTE.E5, dur: 120 },
        { freq: NOTE.G5, dur: 120 },
        { freq: NOTE.E5, dur: 80  },
        { freq: NOTE.G5, dur: 80  },
        { freq: NOTE.A5, dur: 600 },
    ],
};

function bigTime(timeStr) {
    // timeStr like "25:00"
    const digits = {
        '0': ['███', '█ █', '█ █', '█ █', '███'],
        '1': [' ██', '  █', '  █', '  █', '  █'],
        '2': ['███', '  █', '███', '█  ', '███'],
        '3': ['███', '  █', '███', '  █', '███'],
        '4': ['█ █', '█ █', '███', '  █', '  █'],
        '5': ['███', '█  ', '███', '  █', '███'],
        '6': ['███', '█  ', '███', '█ █', '███'],
        '7': ['███', '  █', '  █', '  █', '  █'],
        '8': ['███', '█ █', '███', '█ █', '███'],
        '9': ['███', '█ █', '███', '  █', '███'],
        ':': [' ', '█', ' ', '█', ' '],
    };

    const rows = ['', '', '', '', ''];
    for (const ch of timeStr) {
        const d = digits[ch] || digits['0'];
        for (let i = 0; i < 5; i++) {
            rows[i] += d[i] + '  ';
        }
    }
    return rows;
}

function clearLines(n) {
    for (let i = 0; i < n; i++) {
        process.stdout.write('\x1B[1A\x1B[2K'); // move up + clear line
    }
}

async function runPhase(label, totalSeconds, colorFn, phaseSymbol, tune = null) {
    return new Promise((resolve, reject) => {
        let remaining = totalSeconds;
        let linesPrinted = 0;

        const draw = () => {
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            const urgentColor = remaining <= 60 && remaining > 0 ? chalk.red.bold : colorFn;

            const rows = bigTime(timeStr);
            const bar = buildProgressBar(totalSeconds - remaining, totalSeconds);

            // Clear previous draw
            if (linesPrinted > 0) clearLines(linesPrinted);

            const lines = [];
            lines.push('');
            lines.push(`  ${phaseSymbol}  ${chalk.bold(label)}`);
            lines.push('');
            rows.forEach(row => lines.push('  ' + urgentColor(row)));
            lines.push('');
            lines.push('  ' + bar);
            lines.push('');
            lines.push(chalk.gray('  Press Ctrl+C to stop the session.'));
            lines.push('');

            lines.forEach(l => process.stdout.write(l + '\n'));
            linesPrinted = lines.length;
        };

        draw();

        const interval = setInterval(() => {
            remaining--;
            draw();

            if (remaining < 0) {
                clearInterval(interval);
                if (linesPrinted > 0) clearLines(linesPrinted);
                if (tune) playTune(tune);
                resolve();
            }
        }, 1000);

        // Handle Ctrl+C gracefully
        const onSigInt = () => {
            clearInterval(interval);
            if (linesPrinted > 0) clearLines(linesPrinted);
            reject(new Error('STOPPED'));
        };
        process.once('SIGINT', onSigInt);

        // Clean up SIGINT listener when done
        const origResolve = resolve;
        resolve = (...args) => {
            process.removeListener('SIGINT', onSigInt);
            origResolve(...args);
        };
    });
}

function buildProgressBar(elapsed, total) {
    const BAR_WIDTH = 40;
    const filled = Math.min(BAR_WIDTH, Math.max(0, Math.round((elapsed / total) * BAR_WIDTH)));
    const empty = BAR_WIDTH - filled;
    const bar = chalk.cyan('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    const pct = Math.min(100, Math.round((elapsed / total) * 100));
    return `[${bar}] ${chalk.white(pct + '%')}`;
}

async function showPhaseComplete(label, isBreak) {
    console.clear();
    console.log();
    if (isBreak) {
        console.log(chalk.green.bold('  Break over! Back to work, hax0r.'));
    } else {
        console.log(chalk.yellow.bold('  Work session done! Take a breather.'));
    }
    console.log(chalk.gray(`     Finished: ${label}`));
    console.log();
    await new Promise(r => setTimeout(r, 2500));
}

export default async function sessionTimer() {
    console.clear();
    console.log(chalk.bold.magenta('\n  Session Timer (Pomodoro)\n'));

    const config = await inquirer.prompt([
        {
            name: 'workMinutes',
            type: 'input',
            message: 'Work duration (minutes):',
            default: '25',
            validate: v => (!isNaN(v) && Number(v) > 0) || 'Enter a positive number',
            filter: v => Number(v),
        },
        {
            name: 'breakMinutes',
            type: 'input',
            message: 'Break duration (minutes):',
            default: '5',
            validate: v => (!isNaN(v) && Number(v) > 0) || 'Enter a positive number',
            filter: v => Number(v),
        },
        {
            name: 'cycles',
            type: 'input',
            message: 'Number of work cycles:',
            default: '4',
            validate: v => (!isNaN(v) && Number(v) > 0) || 'Enter a positive number',
            filter: v => Number(v),
        },
    ]);

    const { workMinutes, breakMinutes, cycles } = config;
    const totalWorkSecs = workMinutes * 60;
    const totalBreakSecs = breakMinutes * 60;

    console.clear();
    console.log(chalk.cyan(`\n  Starting ${cycles} × ${workMinutes}min work / ${breakMinutes}min break\n`));
    await new Promise(r => setTimeout(r, 1500));

    try {
        for (let cycle = 1; cycle <= cycles; cycle++) {
            console.clear();

            // Work phase
            const workLabel = `Work Session ${cycle} / ${cycles}`;
            await runPhase(workLabel, totalWorkSecs, chalk.cyan.bold, '[WORK]', TUNES.workDone);
            await showPhaseComplete(workLabel, false);

            // Break phase (skip after last cycle)
            if (cycle < cycles) {
                console.clear();
                const breakLabel = `Break ${cycle} / ${cycles - 1}`;
                await runPhase(breakLabel, totalBreakSecs, chalk.green.bold, '[BREAK]', TUNES.breakDone);
                await showPhaseComplete(breakLabel, true);
            }
        }

        // All done!
        console.clear();
        console.log();
        console.log(chalk.bold.magenta('  ██████╗  ██████╗ ███╗   ██╗███████╗██╗'));
        console.log(chalk.bold.magenta('  ██╔══██╗██╔═══██╗████╗  ██║██╔════╝██║'));
        console.log(chalk.bold.magenta('  ██║  ██║██║   ██║██╔██╗ ██║█████╗  ██║'));
        console.log(chalk.bold.magenta('  ██║  ██║██║   ██║██║╚██╗██║██╔══╝  ╚═╝'));
        console.log(chalk.bold.magenta('  ██████╔╝╚██████╔╝██║ ╚████║███████╗██╗'));
        console.log(chalk.bold.magenta('  ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝'));
        console.log();
        console.log(chalk.white(`  All ${cycles} cycles done. Good work, hax0r.`));
        console.log();
        process.stdout.write('\n');
        playTune(TUNES.allDone);
        await new Promise(r => setTimeout(r, 3000));

    } catch (err) {
        if (err.message === 'STOPPED') {
            console.clear();
            console.log(chalk.yellow('\n  Session stopped. Come back when you\'re ready.\n'));
            await new Promise(r => setTimeout(r, 1500));
        } else {
            throw err;
        }
    }

    console.clear();
}
