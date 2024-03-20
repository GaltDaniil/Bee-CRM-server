import * as TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';

dotenv.config();
const { TELEGRAM_TOKEN } = process.env;

export const tgBot = new TelegramBot(TELEGRAM_TOKEN as string, {
    polling: true,
});
