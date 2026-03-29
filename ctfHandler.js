import { createSpinner } from 'nanospinner';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { exec } from 'child_process';
import { existsSync } from 'fs';
import { ctfTools } from './paths.js';

async function openTool(toolPaths, downloadLink, name, alternativeSite = null) {
    const spinner = createSpinner(`Looking for ${name}...`).start();
    
    for (const path of toolPaths) {
        if (existsSync(path)) {
            exec(`start "" "${path}"`, (error) => {
                if (error) {
                    spinner.error({ text: `Failed to open ${name}: ${error.message}` });
                    return;
                }
                spinner.success({ text: `Opened ${name}` });
            });
            return true;
        }
    }
    
    if (alternativeSite) {
        spinner.warn({ text: `${name} not found. Opening alternative site: ${alternativeSite}` });
        exec(`start "" "${alternativeSite}"`);
        return true;
    }
    
    spinner.warn({ text: `${name} not found. You can download it from: ${downloadLink}` });
    return false;
}

export default async function ctfHandler() {
    console.clear();
    console.log(chalk.bold.magenta('\n=== CTF sh1t ===\n\n'));


    const { tool } = await inquirer.prompt({
        name: 'tool',
        type: 'list',
        message: 'Ch00se categ0ry f0r t00Ls:',
        choices: [
            'Virtual Machine',
            'Forensics',
            'Web Exploitation',
            'Rev/Pwn',
            new inquirer.Separator(),
            'Return to Main Menu'
        ],
    });

    if (tool == 'Return to Main Menu') {
        console.clear();
        return;
    }

    const spinner = createSpinner(`D0inG sTuff f0r ${tool}...`).start();
    try {
        await new Promise(resolve => setTimeout(resolve, 800));
        spinner.stop();
        console.clear();

        switch (tool) {
            case 'Virtual Machine':
                const vmPaths = ctfTools.forensics.virtualMachine.vmware.paths;
                const vmLinks = ctfTools.forensics.virtualMachine.vmware.downloadLinks;
                await openTool(vmPaths, `VMware: ${vmLinks.vmware}\nVirtualBox: ${vmLinks.virtualbox}`, "Virtual Machine");
                break;
            case 'Forensics':
                await openTool(ctfTools.forensics.wireshark.paths, ctfTools.forensics.wireshark.downloadLink, "Wireshark");
                break;
            case 'Web Exploitation':
                await openTool(ctfTools.webExploit.burpSuite.paths, ctfTools.webExploit.burpSuite.downloadLink, "Burp Suite");
                break;
            case 'Rev/Pwn':
                await openTool(ctfTools.revPwn.binaryNinja.paths, ctfTools.revPwn.binaryNinja.downloadLink, "Binary Ninja", ctfTools.revPwn.binaryNinja.alternativeSite);
                break;
        }
    } catch (err) {
        spinner.error({ text: `Error: ${err.message}` });
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
}