import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function expandEnvPath(p) {
    return p.replace(/%([^%]+)%/g, (_, n) => process.env[n] || '');
}

function getRegistryApps() {
    try {
        const pscmd = `Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* -ErrorAction SilentlyContinue | Select-Object DisplayName, DisplayIcon, InstallLocation | ConvertTo-Json -Depth 1`;
        const output = execSync(`powershell -NoProfile -Command "${pscmd}"`, { stdio: ['pipe', 'pipe', 'ignore'], maxBuffer: 1024 * 1024 * 10 });
        if (!output) return [];
        let parsed = JSON.parse(output.toString());
        if (!Array.isArray(parsed)) parsed = [parsed];
        return parsed.filter(app => app && app.DisplayName);
    } catch (e) {
        return [];
    }
}

function extractDirsFromRegApp(app) {
    const dirs = new Set();


    if (app.InstallLocation && typeof app.InstallLocation === 'string' && app.InstallLocation.trim() !== '') {
        dirs.add(app.InstallLocation.trim());
    }

    if (app.DisplayIcon && typeof app.DisplayIcon === 'string') {
        let iconPath = app.DisplayIcon.split(',')[0].trim();
        if (iconPath.startsWith('"') && iconPath.endsWith('"')) {
            iconPath = iconPath.slice(1, -1);
        }
        if (iconPath && fs.existsSync(iconPath)) {
            dirs.add(path.dirname(iconPath));
            if (iconPath.toLowerCase().endsWith('.exe')) {
                dirs.add('FILE_ITSELF:' + iconPath);
            }
        }
    }
    return Array.from(dirs);
}


export async function runPathScan(fallbackPaths) {
    let config = {};
    const regApps = getRegistryApps();

    const expectedExes = {
        spotify: ['Spotify.exe'],
        intellij: ['idea64.exe'],
        notepad: ['notepad++.exe'],
        wireshark: ['Wireshark.exe'],
        vmware: ['vmware.exe', 'VirtualBox.exe'],
        burpSuite: ['BurpSuiteCommunity.exe'],
        binaryNinja: ['binaryninja.exe'],
        cloudflareWarp: ['Cloudflare WARP.exe', 'CloudflareWARP.exe']
    };

    const tryFind = (appKey, exesToLookFor, fallbackArr) => {
        if (fallbackArr) {
            for (let rawPath of fallbackArr) {
                const expanded = expandEnvPath(rawPath);
                if (fs.existsSync(expanded)) return expanded;
            }
        }

        if (!exesToLookFor) return null;
        for (let app of regApps) {
            let nameMatch = false;
            let dn = app.DisplayName.toLowerCase();

            if (appKey === 'burpSuite' && (dn.includes('burp') || dn.includes('portswigger'))) nameMatch = true;
            else if (appKey === 'binaryNinja' && dn.includes('binary ninja')) nameMatch = true;
            else if (appKey === 'cloudflareWarp' && dn.includes('cloudflare')) nameMatch = true;
            else if (dn.includes(appKey.toLowerCase()) || (appKey === 'notepad' && dn.includes('notepad++'))) nameMatch = true;

            if (nameMatch || dn.includes('vmware') || dn.includes('virtualbox') || dn.includes('idea')) {
                const possibleDirs = extractDirsFromRegApp(app);
                for (let dir of possibleDirs) {
                    if (dir.startsWith('FILE_ITSELF:')) {
                        let potentialFile = dir.replace('FILE_ITSELF:', '');
                        for (let exe of exesToLookFor) {
                            if (potentialFile.toLowerCase().endsWith(exe.toLowerCase())) {
                                return potentialFile;
                            }
                        }
                    } else {
                        for (let exe of exesToLookFor) {
                            let testPath = path.join(dir, exe);
                            if (fs.existsSync(testPath)) return testPath;
                            testPath = path.join(dir, 'bin', exe);
                            if (fs.existsSync(testPath)) return testPath;
                        }
                    }
                }
            }
        }
        return null;
    };

    for (const [key, pathsArray] of Object.entries(fallbackPaths)) {
        const found = tryFind(key, expectedExes[key] || [], pathsArray);
        if (found) {
            config[key] = [found];
        } else {
            config[key] = pathsArray.map(p => expandEnvPath(p));
        }
    }

    return config;
}
