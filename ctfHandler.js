import { createSpinner } from 'nanospinner';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { exec } from 'child_process';
import { existsSync } from 'fs';

const tools = {
    forensics: {
        wireshark: {
            paths: [
                "C:\\Program Files\\Wireshark\\Wireshark.exe",
                "C:\\Program Files (x86)\\Wireshark\\Wireshark.exe"
            ],
            downloadLink: "https://www.wireshark.org/download.html"
        },
        virtualMachine: {
            vmware: {
                paths: [
                    "C:\\Program Files (x86)\\VMware\\VMware Workstation\\vmware.exe",
                    "C:\\Program Files\\Oracle\\VirtualBox\\VirtualBox.exe"
                ],
                downloadLinks: {
                    vmware: "https://www.vmware.com/products/workstation-player.html",
                    virtualbox: "https://www.virtualbox.org/wiki/Downloads"
                }
            }
        }
    },
    webExploit: {
        burpSuite: {
            paths: [
                "C:\\Program Files\\BurpSuiteCommunity\\BurpSuiteCommunity.exe",
                "C:\\Program Files (x86)\\BurpSuiteCommunity\\BurpSuiteCommunity.exe",
                "C:\\Users\\Akash\\AppData\\Local\\Programs\\BurpSuiteCommunity\\BurpSuiteCommunity.exe" //this is where mine is stored.
            ],
            downloadLink: "https://portswigger.net/burp/communitydownload"
        }
    },
    revPwn: {
        binaryNinja: {
            paths: [
                "C:\\Program Files\\Binary Ninja\\binaryninja.exe",
                "C:\\Users\\Akash\\AppData\\Local\\Programs\\Vector35\\BinaryNinja\\binaryninja.exe" //this is where mine is stored.
            ],
            downloadLink: "https://binary.ninja/",
            alternativeSite: "https://dogbolt.org/"
        }
    }
};

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
    while (true) {
        console.clear();
        console.log(chalk.bold.magenta('\n=== CTF sh1t ===\n\n'));


        const { tool } = await inquirer.prompt({
            name: 'tool',
            type: 'list',
            message: 'Ch00se categ0ry f0r t00Ls:',
            choices: [
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
                case 'Forensics':
                    await openTool(tools.forensics.wireshark.paths, tools.forensics.wireshark.downloadLink, "Wireshark");
                    const vmPaths = tools.forensics.virtualMachine.vmware.paths;
                    const vmLinks = tools.forensics.virtualMachine.vmware.downloadLinks;
                    await openTool(vmPaths, `VMware: ${vmLinks.vmware}\nVirtualBox: ${vmLinks.virtualbox}`, "Virtual Machine");
                    break;
                case 'Web Exploitation':
                    await openTool(tools.webExploit.burpSuite.paths, tools.webExploit.burpSuite.downloadLink, "Burp Suite");
                    break;
                case 'Rev/Pwn':
                    await openTool(tools.revPwn.binaryNinja.paths, tools.revPwn.binaryNinja.downloadLink, "Binary Ninja", tools.revPwn.binaryNinja.alternativeSite);
                    break;
            }
        } catch (err) {
            spinner.error({ text: `Error: ${err.message}` });
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }
}