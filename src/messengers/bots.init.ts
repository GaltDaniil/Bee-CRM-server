import * as TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import { VK } from 'vk-io';
import { Client, ClientOptions } from 'whatsapp-web.js';

import puppeteer from 'puppeteer';

dotenv.config();

const { TELEGRAM_TOKEN, VK_TOKEN } = process.env;

const waBot = new Client({
    webVersionCache: {
        type: 'remote',
        remotePath:
            'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.51.html',
    },
    puppeteer: { args: ['--no-sandbox'] },
});

const tgBot = new TelegramBot(TELEGRAM_TOKEN as string, {
    polling: true,
});

const vkBot = new VK({ token: VK_TOKEN! });

export { tgBot, vkBot, waBot };
