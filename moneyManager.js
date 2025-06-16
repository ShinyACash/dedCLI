import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import envManager from './utils/envManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

envManager.loadEnv();

const WALLET_FILE = path.join(__dirname, '.wallet.enc');
const SECRET_KEY = process.env.WALLET_SECRET;
if (!SECRET_KEY) {
    console.error(chalk.red('FATAL: Missing WALLET_SECRET in .env file'));
    process.exit(1);
}

class MoneyManager {
    constructor() {
        this.balance = 0;
        this.loadWallet();
    }

    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc',
            crypto.scryptSync(SECRET_KEY, 'salt', 32),
            iv
        );
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }

    // i just know some of yall gonna mess with this. //
    decrypt(text) {
        const [ivHex, encrypted] = text.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc',
            crypto.scryptSync(SECRET_KEY, 'salt', 32),
            iv
        );
        let decrypted = decipher.update(encrypted, 'hex', 'utf8'); 
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    loadWallet() {
        try {
            if (fs.existsSync(WALLET_FILE)) {
                const encrypted = fs.readFileSync(WALLET_FILE, 'utf8');
                this.balance = parseInt(this.decrypt(encrypted)) || 100; 
            } else {
                this.balance = 100; 
                this.saveWallet();
            }
        } catch (error) {
            console.error(chalk.red('Wallet corrupted! Resetting to 100.'));
            this.balance = 100;
            this.saveWallet();
        }
    }

    saveWallet() {
        fs.writeFileSync(WALLET_FILE, this.encrypt(this.balance.toString()), 'utf8');
    }

    getBalance() {
        return this.balance;
    }

    add(amount) {
        this.balance += amount;
        this.saveWallet();
        return this.balance;
    }

    deduct(amount) {
        if (this.balance >= amount) {
            this.balance -= amount;
            this.saveWallet();
            return true;
        }
        return false;
    }
}

export default new MoneyManager(); // **Singleton instance //