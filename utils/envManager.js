import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENCRYPTED_ENV_PATH = path.join(__dirname, '../.env.enc');

class EnvManager {
    constructor() {
        this.machineKey = this._generateMachineKey();
    }

    _generateMachineKey() {
        const hardwareHash = crypto.createHash('sha256')
            .update(os.hostname())
            .update(os.arch())
            .update(os.cpus()[0].model)
            .update(os.totalmem().toString())
            .digest('hex');
        return hardwareHash.substring(0, 32); 
    }

    _encrypt(data) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.machineKey, iv);
        return Buffer.concat([
            iv,
            cipher.update(data),
            cipher.final()
        ]).toString('base64');
    }

    _decrypt(encrypted) {
        const buffer = Buffer.from(encrypted, 'base64');
        const iv = buffer.subarray(0, 16);
        const data = buffer.subarray(16);
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.machineKey, iv);
        return Buffer.concat([
            decipher.update(data),
            decipher.final()
        ]).toString();
    }

    initializeEnv() {
        if (!fs.existsSync(ENCRYPTED_ENV_PATH)) {
            const randomKey = crypto.randomBytes(32).toString('hex');
            const envContent = `WALLET_SECRET=${randomKey}\n`;
            fs.writeFileSync(ENCRYPTED_ENV_PATH, this._encrypt(envContent));
            console.log(chalk.green('🔐 Generated secure environment file'));
            return randomKey;
        }
        return null;
    }

    loadEnv() {
        if (!fs.existsSync(ENCRYPTED_ENV_PATH)) {
            this.initializeEnv();
        }
        const encrypted = fs.readFileSync(ENCRYPTED_ENV_PATH, 'utf8');
        const decrypted = this._decrypt(encrypted);
        decrypted.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) process.env[key] = value.trim();
        });
    }
}

export default new EnvManager();