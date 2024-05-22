import * as TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import { VK } from 'vk-io';

dotenv.config();
const { TELEGRAM_TOKEN, VK_TOKEN } = process.env;

export const tgBot = new TelegramBot(TELEGRAM_TOKEN as string, {
    polling: true,
});

export const vkBot = new VK({ token: VK_TOKEN! });
