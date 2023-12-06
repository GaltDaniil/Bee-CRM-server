/* import TelegramBot from 'node-telegram-bot-api';

import {
    checkContact,
    createContact,
    sendMessage,
} from '../../controllers/Messenger.controller.js';
import { avatarUrlSaver } from './middleware/AvatarLoader.js';
import { urlParser } from './middleware/urlParser.js';
import * as dotenv from 'dotenv';

dotenv.config();

const { TELEGRAM_TOKEN } = process.env;

export const tgBot = new TelegramBot(TELEGRAM_TOKEN as string, {
    polling: true,
});

interface StartCommandType {
    (msg: TelegramBot.Message, match?: RegExpExecArray | null): void;
}

const startCommand: StartCommandType = async (msg, match) => {
    try {
        const messenger_id = msg.chat.id;
        const messenger_type = 'telegram';
        let account_id = 1;
        let contact_id;
        let from_url = '';

        if (match!.length > 4) {
            const paramsString = match![1].trim();
            const parsedParams = urlParser(paramsString);
            account_id = Number(parsedParams.account_id);
            from_url = parsedParams.from_url!;
        }
        const isContact = await checkContact(messenger_id, messenger_type);

        if (isContact) {
            console.log('есть контакт');
        } else {
            console.log('нет контакта');
            const contact_name = msg.chat.first_name || '';
            const contact_username = msg.from?.username || '';
            let contact_photo_url: string | undefined;

            const userProfilePhotos = await tgBot.getUserProfilePhotos(messenger_id, { limit: 1 });

            let photoUrl = '';
            if (userProfilePhotos && userProfilePhotos.photos.length > 0) {
                const photo = userProfilePhotos.photos[0][0];
                photoUrl = photo ? await tgBot.getFileLink(photo.file_id) : '';
            }
            if (photoUrl) {
                contact_photo_url = await avatarUrlSaver(messenger_id, photoUrl);
            }

            const params = {
                account_id,
                contact_name,
                contact_photo_url,
                messenger_id,
                messenger_type,
                contact_username,
                from_url,
            };
            const result = await createContact(params);
            contact_id = result.id!;
        }

        tgBot.sendMessage(
            msg.chat.id,
            `Здравствуйте, вас приветствует поддержка онлайн школы Linnik Fitness. Какой у вас вопрос?)`,
            //@ts-ignore
            { is_bot_message: true },
        );
    } catch (error) {
        console.log(error);
    }
};

export const startTelegramBot = () => {
    tgBot.onText(/\/start(.+)/, startCommand);
    tgBot.onText(/\/start$/, startCommand);

    tgBot.on('message', async (msg) => {
        if (msg.text!.length < 2) return;
        const messenger_id = msg.chat.id;
        const messenger_type = 'telegram';
        const from_contact = true;
        let contact_id: number;

        const isHaveContact = await checkContact(messenger_id, messenger_type);

        if (isHaveContact) {
            contact_id = isHaveContact.id!;
        } else {
            const contact_name = msg.chat.first_name || '';
            const contact_username = msg.from?.username || '';
            let contact_photo_url: string | undefined;

            const userProfilePhotos = await tgBot.getUserProfilePhotos(messenger_id, { limit: 1 });

            let photoUrl = '';
            if (userProfilePhotos && userProfilePhotos.photos.length > 0) {
                const photo = userProfilePhotos.photos[0][0];
                photoUrl = photo ? await tgBot.getFileLink(photo.file_id) : '';
            }
            if (photoUrl) {
                contact_photo_url = await avatarUrlSaver(messenger_id, photoUrl);
            }

            const params = {
                account_id: 1,
                contact_name,
                contact_photo_url,
                messenger_id,
                messenger_type,
                contact_username,
            };
            const result = await createContact(params);
            contact_id = result.id!;
        }
        await sendMessage(contact_id, msg.text!, from_contact);
    });
}; */
