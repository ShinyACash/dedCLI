#!/usr/bin/env node

// Dependency check utility
async function checkDependencies() {
    const required = [
        { name: 'chalk', importName: 'chalk' },
        { name: 'inquirer', importName: 'inquirer' },
        { name: 'gradient-string', importName: 'gradient-string' },
        { name: 'figlet', importName: 'figlet' },
        { name: 'nanospinner', importName: 'nanospinner' },
        { name: 'chalk-animation', importName: 'chalk-animation' }
    ];
    let missing = [];
    for (const dep of required) {
        try {
            await import(dep.importName);
            //console.log(chalk.green(`+ ${dep.name} is installed`));
        } catch (e) {
            missing.push(dep.name);
        }
    }
    if (missing.length > 0) {
        console.log('\n' + chalk.red('Missing dependencies detected:'));
        missing.forEach(dep => console.log(chalk.yellow(' - ' + dep)));
        console.log(chalk.cyan('\nPlease run ') + chalk.green('npm install') + chalk.cyan(' before using this CLI.\n'));
        process.exit(1);
    }
}

await checkDependencies();

import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
//import puppeteer from 'puppeteer';
//import { execSync } from 'child_process';
//import chalkAnimation from 'chalk-animation'; //not needed for now, but can be used for animations later on
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import { exec, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import envManager from './utils/envManager.js';
import { appPaths, downloadLinks, sites, ctfTools } from './paths.js';

envManager.initializeEnv();

const sleep = (ms = 450) => new Promise((r) => setTimeout(r, ms));

const configPath = path.resolve('.dedsec_paths.json');
if (!fs.existsSync(configPath)) {
    console.clear();
    const spinner = createSpinner('Initializing first-time setup... Scanning registry for tools...').start();
    try {
        const { runPathScan } = await import('./utils/pathScanner.js');
        const resolvedConfigs = await runPathScan(appPaths);
        fs.writeFileSync(configPath, JSON.stringify(resolvedConfigs, null, 4));
        
        Object.assign(appPaths, resolvedConfigs);
        if (resolvedConfigs.wireshark) ctfTools.forensics.wireshark.paths = resolvedConfigs.wireshark;
        if (resolvedConfigs.vmware) ctfTools.forensics.virtualMachine.vmware.paths = resolvedConfigs.vmware;
        if (resolvedConfigs.burpSuite) ctfTools.webExploit.burpSuite.paths = resolvedConfigs.burpSuite;
        if (resolvedConfigs.binaryNinja) ctfTools.revPwn.binaryNinja.paths = resolvedConfigs.binaryNinja;

        spinner.success({ text: 'Scanner complete. Configuration cached locally.' });
    } catch (e) {
        spinner.error({ text: 'Scanner failed. Using fallback paths.' });
    }
    await sleep(2000);
    console.clear();
}
let run = true;
let bannerShown = false;




    const art1 = `

                          ÿþÙ®xÞÿZÚNpbi³ 
                        ZHU¾{IÎo‹3žs—nñŸÕw          
                      ·ÿZ¤)Uƒ¾}Jçû•ì5n·|*¡pÖ           
                     ìgÎ¸î[>{3[Cì2+V¡       dh                 
                     NNNNÄRÕÎù±<&Lô          tÛ;                       
                    HNNNNNœÔë4‘ß               õH                      
                   žNNNNNNNNò§w±|               oÒ    ██████╗ █████╗██████╗ █████╗█████╗ ████╗
                   qNNNNNNNNNEo—n{               ¼n   ██╔══██╗██╔══╝██╔══██╗██╔══╝██╔══╝██╔══╝
                  ïKNNNNNNNNNNNNNžFc•%           µn   ██║  ██║███╗  ██║  ██║█████╗███╗  ██║
                  bNNNNNNNNNNNNNNNXsw%³w‰º  |   oœ¸   ██║  ██║██═╝  ██║  ██║╚══██║██╔╝  ██║
                  ŸNNNNNNNNNNNNNNNNZ“s¼2   *o   od    ██████╔╝█████╗██████╔╝█████║█████╗╚████╗
                   éNNN¶ëÓÕÕÕNNNNNN/             H%   ╚═════╝ ╚════╝╚═════╝ ╚════╝╚════╝ ╚═══╝
                    ÿNNGþNNþ©ÜNNN2   *£ÇøEõ   ~Úþìˆ§                    
                     …KNNNNNNNNNN.  ¡êNNNNþó   Òœ íC                    
                      lHNNNNNNNNdw»  ø©3gþ®    ws ¿‚             ██████╗██████╗██████╗
                       ¢ENNNNNNNNEÄôí ›ôÛ±  3þê  c               ╚═════╝╚═════╝╚═════╝
                         hœNNNNNNNNNÄ      Ýê– “Çû                      
                           ÐN¶ÍNNNNNNÛ=”       ù
                           êN5éNþNNNN ÝÎ= !;/ =                        
                            ±ê€ÔnXNNNþP ñZ·¦’ ï                        
                             –ÕÖZÔ%Ò§w^| HC  5^                        
                               ˆõAÄR±†¹    õ|                          
                                   ¯Zës{ ¢Ú»  


    `;
async function banner() {
    const msg = `Welcome to DEDSEC.`;
    const art = `
  ██╗    ██╗███████╗██╗      ██████╗ ███╗   ███╗███████╗    ████████╗ ██████╗
  ██║    ██║██╔════╝██║     ██╔═══██╗████╗ ████║██╔════╝    ╚══██╔══╝██╔═══██╗
  ██║ █╗ ██║█████╗  ██║     ██║   ██║██╔████╔██║█████╗         ██║   ██║   ██║
  ██║███╗██║██╔══╝  ██║     ██║   ██║██║╚██╔╝██║██╔══╝         ██║   ██║   ██║
  ╚███╔███╔╝███████╗███████╗╚██████╔╝██║ ╚═╝ ██║███████╗       ██║   ╚██████╔╝
   ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝       ╚═╝    ╚═════╝
  ██████╗ ███████╗██████╗  ██████╗██╗     ██╗
  ██╔══██╗██╔════╝██╔══██╗██╔════╝██║     ██║
  ██║  ██║█████╗  ██║  ██║██║     ██║     ██║
  ██║  ██║██╔══╝  ██║  ██║██║     ██║     ██║
  ██████╔╝███████╗██████╔╝╚██████╗███████╗██║
  ╚═════╝ ╚══════╝╚═════╝  ╚═════╝╚══════╝╚═╝
    `;
    

    figlet(msg, (err, data) => {
        console.log(gradient(['white', 'gray'])(art));
        console.log('\n Made with l0v3 ' + chalk.magenta('<3') + ' f0r mys3lf hehe. \n -Shiny ☆\n');
    });
}


async function mainMenu() {
    const answers = await inquirer.prompt({
        name: 'mmchoice',
        type: 'list',
        message: 'Select wh4t you wanna do hax0r: \n',
        choices: [
            'Connect to SRMIST',
            'Cloudflare Warp',
            new inquirer.Separator(),
            'Lock tf in (Spotify)',
            'CTF',
            'STEP',
            'Get yo shit done (To do)', 
            new inquirer.Separator(),
            'Clipboard History',
            'Log Viewer',
            'Session Timer',
            new inquirer.Separator(),
            'Placeholder',
            'Github (dev)',
            'Minigames :))', 
            'Custom Apps',
            new inquirer.Separator(),
            '[d3v C0ns0l3]',
            'Clear',
            'eX1t',
            new inquirer.Separator(),
        ],
    });

    return handleAnswer(answers.mmchoice);

}

async function logErrorToFile(error) {
    if (!error) return; // don't log null/undefined (e.g. exec callback when no error occurred)
    const logPath = path.resolve('log.txt');
    const now = new Date().toISOString();
    const logEntry = `[${now}] ${error}\n`;
    fs.appendFileSync(logPath, logEntry, 'utf8');
}

async function handleAnswer(choice) {
    const spinner = createSpinner('Doing sh1t have pat1enc3...\n').start();
    await sleep(500);
    try {

        if (choice == 'Connect to SRMIST') {


            const ssid = "SRMIST";

            exec(`netsh wlan connect name="${ssid}"`, (error) => {
                if (error) {
                    spinner.error(`Error connecting: ${error.message}`);
                    return;
                }
                
                spinner.success(`Connected to Wi-Fi network: ${ssid}`);
            });

        }

        else if (choice == '[d3v C0ns0l3]') {
            spinner.success({ text: "entering debug console" });
            console.clear();
            try {
                const { default: devConsole } = await import('./devConsole.js');
                await devConsole();
                console.clear();
                return mainMenu();
            }
            catch (err) {
                console.error(chalk.red('nice try but access denied :P'), err);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        else if (choice == "Minigames :))") {
            spinner.success({ text: "Entering minigames..." });
            console.clear();
            try {
                const { default: minigameHandler } = await import('./minigameHandler.js');
                await minigameHandler();
                console.clear();
                return mainMenu();
            } catch (err) {
                console.error(chalk.red('Minigame error:'), err);
                logErrorToFile(err); 
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        else if (choice == 'Lock tf in (Spotify)') {
            //spinner.start(`Checking for Spotify's ex1st3nc3...`);
        
            exec('tasklist | findstr Spotify.exe', (error, stdout) => {
                if (stdout.toString().includes('Spotify.exe')) {
                    spinner.success({ text: 'Spotify is already running' });
                }
            
                const spotifyPaths = appPaths.spotify;

                let found = false;
                spotifyPaths.forEach(path => {
                    exec(`start "" "${path}"`, (error) => {
                        if (!error && !found) {
                            found = true;
                            spinner.success({ text: `Sp0tify l4unch3d fr0m: ${path}` });
                        }
                        logErrorToFile(error); 
                    });
                });

                setTimeout(() => {
                    if (!found) {
                        spinner.error({ text: `Bruh, could not find Spotify in your PC dude. Try installing it from: ${downloadLinks.spotify}` });
                    
                    }
                }, 2000);
            });
        }

        else if (choice == "CTF") {
            spinner.success({ text: "Entering CTF Toolkit..." });
            console.clear();
            try {
                const { default: ctfHandler } = await import('./ctfHandler.js');
                await ctfHandler();
                console.clear();
                return mainMenu();
            } catch (err) {
                console.error(chalk.red('Toolkit error:'), err);
                logErrorToFile(err);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        else if (choice == "Get yo shit done (To do)") {

            exec(`start "" "${sites.toDoSite}"`, (error) => {
                if (error) {
                    spinner.error({ text: `00psies failed t0 0pen t0-d0 site: maybe try checking your processes.` });
                    logErrorToFile(error); 
                }
            });
            spinner.success({ text: `0pened t0-d0 s1te for y0u. G3tting y0ur shit d0ne tod4y?` });
        }

       else if (choice == "STEP") {
            spinner.start('Scanning for decoy tools...');

            const tools = [
                {
                    name: 'IntelliJ',
                    paths: appPaths.intellij,
                    processName: 'idea64.exe'
                },
                {
                    name: 'Notepad++',
                    paths: appPaths.notepad,
                    processName: 'notepad++.exe'
                }
            ];

            try {
                let runnin = false;
                const { execSync } = await import('child_process');
                const stdout = execSync('tasklist').toString();

                const runningTool = tools.find(tool => stdout.includes(tool.processName));
                if (runningTool) {
                    spinner.success({ text: `${runningTool.name} already running` });
                    runnin = true;
                }

                if (!runnin) {
                    const { existsSync } = await import('fs');
                    const foundTool = tools.find(tool => 
                        tool.paths.some(path => existsSync(path))
                    );

                    if (!foundTool) {
                        spinner.error({ text: `Bruh, no IntelliJ or Notepad++ f0und on your device, you sure you attend STEP? Unless you use VSC ofc.\n`+
                                              `- IntelliJ IDEA (${downloadLinks.intellij})\n` +
                                              `- Notepad++ (${downloadLinks.notepad})`  });
                        return; // don't continue — foundTool is undefined below this point
                    }

                    const toolPath = foundTool.paths.find(p => existsSync(p));
                    const { spawn } = await import('child_process');
                    spawn('cmd.exe', [
                        '/c', 'start', '""', '/B', toolPath
                    ], {
                        detached: true,
                        stdio: 'ignore'
                    }).unref();

                    spinner.success({ text: `${foundTool.name} launched!` });
                }

            } catch (err) {
                spinner.error({ text: `Scan failed: Pls contact me if you can...` });
                logErrorToFile(err); 
            }
        }

        else if (choice == "Placeholder") {
            spinner.success({ text: 'aight' });
            console.log(gradient(['white', 'gray'])(art1));
        }


        else if (choice == "Github (dev)") {

            exec(`start "" "${sites.github}"`, (error) => {
                if (error) {
                    spinner.error({ text: `00psies failed t0 0pen github: maybe try checking your processes.` });
                    logErrorToFile(error); 
                }
            });
            spinner.success({ text: `0pened my Github for y0u. St4lk1ng mUch?` });
        }

        else if (choice == 'Cloudflare Warp') {
            exec('tasklist | findstr CloudflareWARP.exe', (error, stdout) => {
                if (stdout && stdout.toString().includes('CloudflareWARP.exe')) {
                    spinner.success({ text: 'Cloudflare Warp is already running' });
                    return;
                }
            
                const warpPaths = appPaths.cloudflareWarp;
                let foundPath = warpPaths.find(p => fs.existsSync(p));

                if (foundPath) {
                    spawn('cmd.exe', ['/c', 'start', '""', '/B', foundPath], {
                        detached: true,
                        stdio: 'ignore'
                    }).unref();
                    spinner.success({ text: `Cloudflare Warp launched from: ${foundPath}` });
                } else {
                    spinner.error({ text: `Bruh, could not find Cloudflare Warp on your PC. Download from: ${downloadLinks.cloudflareWarp}` });
                }
            });
        }

        else if (choice == 'Clipboard History') {
            spinner.success({ text: 'Opening Clipboard History...' });
            console.clear();
            try {
                const { default: clipboardHistory } = await import('./clipboardHistory.js');
                await clipboardHistory();
                console.clear();
                return mainMenu();
            } catch (err) {
                console.error(chalk.red('Clipboard History error:'), err);
                logErrorToFile(err);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        else if (choice == 'Log Viewer') {
            spinner.success({ text: 'Opening Log Viewer...' });
            console.clear();
            try {
                const { default: logViewer } = await import('./logViewer.js');
                await logViewer();
                console.clear();
                return mainMenu();
            } catch (err) {
                console.error(chalk.red('Log Viewer error:'), err);
                logErrorToFile(err);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        else if (choice == 'Session Timer') {
            spinner.success({ text: 'Starting Session Timer...' });
            console.clear();
            try {
                const { default: sessionTimer } = await import('./sessionTimer.js');
                await sessionTimer();
                console.clear();
                return mainMenu();
            } catch (err) {
                console.error(chalk.red('Session Timer error:'), err);
                logErrorToFile(err);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        else if (choice == 'Custom Apps') {
            spinner.success({ text: "Entering Custom Apps..." });
            console.clear();
            try {
                const { default: customAppsHandler } = await import('./customAppsHandler.js');
                await customAppsHandler();
                console.clear();
                return mainMenu();
            } catch (err) {
                console.error(chalk.red('Custom Apps error:'), err);
                logErrorToFile(err);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        else if (choice == "Clear") {
            exec('cls', () => { }); 
            process.stdout.write('\x1B[2J\x1B[3J\x1B[H'); // ANSI super-clear just in case cls doesnt work.
            spinner.stop();
            banner();
        }

        else if (choice == "eX1t") {
            spinner.stop();
            exec('taskkill /f /pid ' + process.ppid); // force kill the terminal 💀💀
            return;
        }
    } catch (err) {
        spinner.error({ text: `Error: ${err.message}` });
        logErrorToFile(err);
    } finally {
        if (spinner.isSpinning) spinner.stop();
    }




    if (run) {
        await sleep(1000);
        main();
    }
}
function main() {
    if (bannerShown == false) {
        banner();
    }
    setTimeout(() => {
        mainMenu();
        bannerShown = true;
    }, 100);
}

main();


