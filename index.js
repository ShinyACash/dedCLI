#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import { exec } from 'child_process';
import * as myData from './data.js'; // storing personal data/my own sties hosted on github

const sleep = (ms = 450) => new Promise((r) => setTimeout(r, ms));
let run = true;
let bannerShown = false;

const SITES = [
    'https://dogbolt.org/',
    'https://gchq.github.io/CyberChef/',
    'https://chat.deepseek.com/'
];
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
        //console.log(gradient(['white', 'gray'])(data));
        console.log(gradient(['white', 'gray'])(art));
        console.log('\n Made with l0v3 ' + chalk.magenta('<3') + ' f0r mys3lf hehe.  -Shiny ☆\n');
    });
}


async function mainMenu() {
    const answers = await inquirer.prompt({
        name: 'mmchoice',
        type: 'list',
        message: 'Select wh4t you wanna do hax0r: \n',
        choices: [
            'Lock tf in (Spotify)',
            'CTF',
            'STEP Decoy',
            'Get yo shit done (To do)', 
            'Placeholder',
            'Clear',
            'eX1t',
        ],
    });

    return handleAnswer(answers.mmchoice);

}

async function handleAnswer(choice) {
    const spinner = createSpinner('Doing sh1t have pat1enc3...\n').start();
    await sleep();

    if (choice == 'Lock tf in (Spotify)') {
        
        exec('tasklist | findstr Spotify.exe', (error, stdout) => {
            if (stdout.toString().includes('Spotify.exe')) {
                spinner.success({ text: 'Spotify is already running' });
                return;
            }
            
            const spotifyPaths = [
                '%LOCALAPPDATA%\\Microsoft\\WindowsApps\\Spotify.exe',
                // Can add more if you wanna but this is the most common one
            ];

            let found = false;
            spotifyPaths.forEach(path => {
                exec(`start "" "${path}"`, (error) => {
                    if (!error && !found) {
                        found = true;
                        spinner.success({ text: `Sp0tify l4unch3d fr0m: ${path}` });
                    }
                });
            });

            setTimeout(() => {
                if (!found) {
                    spinner.error({ text: `Bruh, could not find Spotify in your PC dude. Try installing it from the windows store maybe?` });
                    
                }
            }, 2000);
        });
    }

    else if (choice == "CTF") {
        SITES.forEach(site => {
            exec(`start "" "${site}"`, (error) => {
                if (error) {
                    spinner.error({ text: `00psies failed t0 0pen ${site}: maybe try checking your processes.` });
                }
            });
        });
        spinner.success({ text: `0pened 4ll s1tes for y0u.` });
    }

    else if (choice == "Get yo shit done (To do)") {

        exec(`start "" "${myData.toDoSite}"`, (error) => {
            if (error) {
                spinner.error({ text: `00psies failed t0 0pen t0-d0 site: maybe try checking your processes.` });
            }
        });
        spinner.success({ text: `0pened t0-d0 s1te for y0u. G3tting y0ur shit d0ne tod4y?` });
    }

    else if (choice == "STEP Decoy") {
        exec('tasklist | findstr idea64.exe', (error, stdout) => {
            if (stdout.toString().includes('idea64.exe')) {
                spinner.success({ text: 'IntelliJ is already running' });
                return;
            }
            

            const stepPaths = [
                "C:\\Program Files\\JetBrains\\IntelliJ IDEA Community Edition 2024.3.2.2\\bin\\idea64.exe",
                //"C:\\Program Files\\Notepad++\\notepad++.exe"
                // Can add more if you wanna for others if distributed
            ];

            let found = false;
            stepPaths.forEach(path => {
                exec(`start "" "${path}"`, (error) => {
                    if (!error && !found) {
                        found = true;
                        spinner.success({ text: `Step Decoy launched from: ${path}` });
                    }
                });
            });

            setTimeout(() => {
                if (!found) {
                    spinner.error({ text: `Bruh, could not find IntelliJ or notepad++ in your PC dude. You sure you've done shit in step before?` });

                }
            }, 2000);
        });
    }

    else if (choice == "Placeholder") {
        spinner.success({ text: 'aight' });
        console.log(gradient(['white', 'gray'])(art1));
    }

    else if (choice == "Clear") {
        exec('cls', () => { }); 
        process.stdout.write('\x1B[2J\x1B[3J\x1B[H'); // ANSI super-clear just in case cls doesnt work.
        spinner.stop();
        banner();
    }

    else if (choice == "eX1t") {
        run = false;
        process.exit(0);
        return;
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


