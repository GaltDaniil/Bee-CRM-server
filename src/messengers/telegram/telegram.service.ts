import { HttpException, Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import { urlParser } from '../middleware/urlParser';
import { avatarUrlSaver } from '../middleware/AvatarLoader';
import { ContactsService } from 'src/contacts/contacts.service';
import { ChatsService } from 'src/chats/chats.service';
import { Contact } from 'src/contacts/contacts.model';
import { MessagesService } from 'src/messages/messages.service';
import { FilesService } from 'src/files/files.service';
import axios from 'axios';

dotenv.config();
const { TELEGRAM_TOKEN } = process.env;

@Injectable()
export class TelegramService {
    constructor(
        private contactsService: ContactsService,
        private chatsService: ChatsService,
        private messagesService: MessagesService,
        private filesService: FilesService,
    ) {}
    private telegramBot: TelegramBot;

    init() {
        this.telegramBot = new TelegramBot(TELEGRAM_TOKEN as string, {
            polling: true,
        });
        this.telegramBot.onText(/\/start(.+)/, this.startCommand);
        this.telegramBot.onText(/\/start$/, this.startCommand);
        this.telegramBot.on('message', this.messageHandler);
    }
    getBot(): TelegramBot {
        return this.telegramBot;
    }

    private startCommand = async (msg: TelegramBot.message, match: TelegramBot.match) => {
        try {
            const messenger_id = msg.chat.id.toString();
            const messenger_type = 'telegram';
            let account_id: string = 'ecfafe4bc756935e17d93bec';
            let contact_id: string;
            let from_url = '';
            let contact_photo_url: string;

            if (match!.length > 1) {
                const paramsString = match![1].trim();
                const parsedParams = urlParser(paramsString);
                account_id = parsedParams.account_id || 'ecfafe4bc756935e17d93bec';
                from_url = parsedParams.from_url!;
            }

            const isChat = await this.chatsService.getChatByMessengerId(messenger_id);

            if (!isChat) {
                // нужно создать контакт и потом чат.
                //Получится дублеж.будут двойные контакты. Но пока пофиг
                const contact_name: string = msg.chat.first_name || '';
                const messenger_username: string = msg.from?.username || '';

                const avatarFile = await this.getTelegramAvatarFile(messenger_id);

                const fileName = await this.filesService.saveAvatarFromMessenger(
                    avatarFile,
                    messenger_id,
                );

                contact_photo_url = fileName;

                const params = {
                    account_id,
                    contact_name,
                    contact_photo_url,
                };
                const newContact: Contact = await this.contactsService.createContact(params);

                if (newContact) {
                    contact_id = newContact.contact_id;
                    const params = {
                        contact_id,
                        messenger_id,
                        messenger_type,
                        from_url,
                        messenger_username,
                    };

                    const newChat = await this.chatsService.createChat(params);
                }
            }
            this.telegramBot.sendMessage(
                msg.chat.id,
                `Здравствуйте, вас приветствует поддержка онлайн школы Linnik Fitness. Какой у вас вопрос?)`,
                //@ts-ignore
                { is_bot_message: true },
            );
        } catch (error) {
            console.log(error);
        }
    };

    messageHandler = async (msg: TelegramBot.message) => {
        if (msg.text!.length < 2) return;
        if (msg.text === '/start') return;
        const messenger_id = msg.chat.id.toString();
        const messenger_type = 'telegram';
        let account_id: string = 'ecfafe4bc756935e17d93bec';
        let contact_id: string;
        let chat_id: string;
        let contact_photo_url: string;

        const isChat = await this.chatsService.getChatByMessengerId(messenger_id);

        if (!isChat) {
            const contact_name: string = msg.chat.first_name || '';
            const messenger_username: string = msg.from?.username || '';

            const avatarFile = await this.getTelegramAvatarFile(messenger_id);

            const fileName = await this.filesService.saveAvatarFromMessenger(
                avatarFile,
                messenger_id,
            );
            contact_photo_url = fileName;

            const params = {
                account_id,
                contact_name,
                contact_photo_url,
            };
            const newContact: Contact = await this.contactsService.createContact(params);

            if (newContact) {
                contact_id = newContact.contact_id;
                const params = { contact_id, messenger_id, messenger_type, messenger_username };

                const newChat = await this.chatsService.createChat(params);
                chat_id = newChat.chat_id;
            }
        } else {
            chat_id = isChat.chat_id;
            contact_id = isChat.contact_id;
        }
        const params = {
            message_value: msg.text as string,
            message_type: 'text',
            manager_id: '',
            contact_id,
            chat_id,
        };
        await this.messagesService.createMessage(params);
    };

    getTelegramAvatarFile = async (messenger_id: string) => {
        const userProfilePhotos = await this.telegramBot.getUserProfilePhotos(
            Number(messenger_id),
            {
                limit: 1,
            },
        );
        if (userProfilePhotos && userProfilePhotos.photos.length > 0) {
            const photo = userProfilePhotos.photos[0][0];
            const photoUrl = await this.telegramBot.getFileLink(photo.file_id);

            const response = await axios.get(photoUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');
            return imageBuffer;
        }
        return '';
    };
}
