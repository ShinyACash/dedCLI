import fs from 'fs';
import path from 'path';

export const appPaths = {
    spotify: [
        '%LOCALAPPDATA%\\Microsoft\\WindowsApps\\Spotify.exe'
    ],
    intellij: [
        "C:\\Program Files\\JetBrains\\IntelliJ IDEA Community Edition 2024.3.2.2\\bin\\idea64.exe",
        "C:\\Program Files\\JetBrains\\IntelliJ IDEA\\bin\\idea64.exe",
        "C:\\Program Files (x86)\\JetBrains\\IntelliJ IDEA Community Edition\\bin\\idea64.exe"
    ],
    notepad: [
        "C:\\Program Files\\Notepad++\\notepad++.exe",
        "C:\\Program Files (x86)\\Notepad++\\notepad++.exe"
    ],
    wireshark: [
        "C:\\Program Files\\Wireshark\\Wireshark.exe",
        "C:\\Program Files (x86)\\Wireshark\\Wireshark.exe"
    ],
    vmware: [
        "C:\\Program Files (x86)\\VMware\\VMware Workstation\\vmware.exe",
        "C:\\Program Files\\Oracle\\VirtualBox\\VirtualBox.exe"
    ],
    burpSuite: [
        "C:\\Program Files\\BurpSuiteCommunity\\BurpSuiteCommunity.exe",
        "C:\\Program Files (x86)\\BurpSuiteCommunity\\BurpSuiteCommunity.exe",
    ],
    binaryNinja: [
        "C:\\Program Files\\Binary Ninja\\binaryninja.exe",
    ],
    cloudflareWarp: [
        "C:\\Program Files\\Cloudflare\\Cloudflare WARP\\Cloudflare WARP.exe"
    ]
};

export const downloadLinks = {
    spotify: "https://www.spotify.com/download",
    intellij: "https://www.jetbrains.com/idea/download",
    notepad: "https://notepad-plus-plus.org/downloads",
    wireshark: "https://www.wireshark.org/download.html",
    vmware: "VMware: https://www.vmware.com/products/workstation-player.html, VirtualBox: https://www.virtualbox.org/wiki/Downloads",
    burpSuite: "https://portswigger.net/burp/communitydownload",
    binaryNinja: "https://binary.ninja/",
    cloudflareWarp: "https://www.cloudflare.com/products/zero-trust/warp/"
};

export const sites = {
    toDoSite: "https://shinyacash.github.io/To-do-Listsite/",
    github: "https://github.com/ShinyACash",
    SITES: [
        'https://dogbolt.org/',
        'https://gchq.github.io/CyberChef/',
    ]
};

export const ctfTools = {
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
                "C:\\Users\\Akash\\AppData\\Local\\Programs\\BurpSuiteCommunity\\BurpSuiteCommunity.exe"
            ],
            downloadLink: "https://portswigger.net/burp/communitydownload"
        }
    },
    revPwn: {
        binaryNinja: {
            paths: [
                "C:\\Program Files\\Binary Ninja\\binaryninja.exe",
                "C:\\Users\\Akash\\AppData\\Local\\Programs\\Vector35\\BinaryNinja\\binaryninja.exe"
            ],
            downloadLink: "https://binary.ninja/",
            alternativeSite: "https://dogbolt.org/"
        }
    }
};

try {
    const configPath = path.resolve('.dedsec_paths.json');
    if (fs.existsSync(configPath)) {
        const cached = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        Object.assign(appPaths, cached);

        if (cached.wireshark) ctfTools.forensics.wireshark.paths = cached.wireshark;
        if (cached.vmware) ctfTools.forensics.virtualMachine.vmware.paths = cached.vmware;
        if (cached.burpSuite) ctfTools.webExploit.burpSuite.paths = cached.burpSuite;
        if (cached.binaryNinja) ctfTools.revPwn.binaryNinja.paths = cached.binaryNinja;
    }
} catch (e) {
    // Ignore read/parse errors
}