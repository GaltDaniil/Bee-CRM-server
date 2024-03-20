import { HttpException, Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import { urlParser } from '../middleware/urlParser';
import { ContactsService } from 'src/contacts/contacts.service';
import { ChatsService } from 'src/chats/chats.service';
import { Contact } from 'src/contacts/contacts.model';
import { FilesService } from 'src/files/files.service';
import axios from 'axios';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';
import { Message } from 'src/messages/messages.model';
import { InjectModel } from '@nestjs/sequelize';
import { customAlphabet } from 'nanoid';
import { EventGateway } from 'src/event/event.gateway';
import { tgBot } from '../bots.init';
const nanoid = customAlphabet('abcdef123456789', 24);

dotenv.config();
const { TELEGRAM_TOKEN } = process.env;

@Injectable()
export class TelegramService {
    constructor(
        @InjectModel(Message) private messageRepository: typeof Message,
        private contactsService: ContactsService,
        private chatsService: ChatsService,
        private filesService: FilesService,
        private eventGateway: EventGateway,
    ) {}
    telegramBot: TelegramBot;

    init() {
        this.telegramBot = tgBot;
        this.telegramBot.onText(/\/start(.+)/, this.startCommand);
        this.telegramBot.onText(/\/start$/, this.startCommand);
        this.telegramBot.on('message', this.messageHandler);
    }
    getBot(): TelegramBot {
        return this.telegramBot;
    }

    sendMessage(chatId: number, message: string) {
        this.telegramBot.sendMessage(chatId, message);
    }

    private startCommand = async (msg: TelegramBot.message, match: TelegramBot.match) => {
        try {
            const messenger_id = msg.chat.id.toString();
            const messenger_type = 'telegram';
            let account_id: string = 'ecfafe4bc756935e17d93bec';
            let contact_id: string;
            let from_url = '';
            let contact_photo_url: string = '';
            console.log('match', match);
            console.log(match!.length);

            if (match!.length > 1) {
                console.log('match!.length > 4');
                const paramsString = match![1].trim();
                console.log('paramsString', paramsString);
                const parsedParams = urlParser(paramsString);
                console.log('parsedParams', parsedParams);
                account_id = parsedParams.account_id || 'ecfafe4bc756935e17d93bec';
                from_url = parsedParams.from_url!;
            }

            const isChat = await this.chatsService.getChatByMessengerId(messenger_id);

            if (!isChat) {
                console.log('создание контакта из startCommand');
                // нужно создать контакт и потом чат.
                //Получится дублеж.будут двойные контакты. Но пока пофиг
                const contact_name: string = msg.chat.first_name || '';
                const messenger_username: string = msg.from?.username || '';

                const avatarFile = await this.getTelegramAvatarFile(messenger_id);
                if (avatarFile) {
                    const fileName = await this.filesService.saveAvatarFromMessenger(
                        avatarFile,
                        messenger_id,
                    );

                    contact_photo_url = fileName;
                }

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
        const startCommandRegex = /^\/start/i;
        if (msg.text!.length < 2) return;
        if (startCommandRegex.test(msg.text)) return;
        console.log(msg);
        const messenger_id = msg.chat.id.toString();
        const messenger_type = 'telegram';
        let account_id: string = 'ecfafe4bc756935e17d93bec';
        let contact_id: string;
        let chat_id: string;
        let contact_photo_url: string;

        const isChat = await this.chatsService.getChatByMessengerId(messenger_id);

        if (!isChat) {
            console.log('создание контакта из messageHandler');
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
            messenger_type: 'telegram',
            manager_id: '',
            contact_id,
            chat_id,
        };
        this.sendMessageFromTelegram(params);
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

    sendMessageFromTelegram = async (params: CreateMessageDto) => {
        //@ts-ignore
        params.message_id = nanoid();
        const message = await this.messageRepository.create(params);

        this.chatsService.addUnreadCount(params.chat_id);
        this.eventGateway.ioServer.emit('update');

        return message;
    };
}
