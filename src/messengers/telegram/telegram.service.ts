import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
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
import { AttachmentsService } from 'src/attachments/attachments.service';
import { MessagesService } from 'src/messages/messages.service';
import { autoresponder } from '../chatbot/autoresponder';
import { MessengerAttachment, MessengerAttachments } from 'src/attachments/dto/attachment.dto';
const nanoid = customAlphabet('abcdef123456789', 24);

dotenv.config();
const { TELEGRAM_TOKEN } = process.env;

@Injectable()
export class TelegramService {
    constructor(
        private contactsService: ContactsService,
        @Inject(forwardRef(() => MessagesService)) private messagesService: MessagesService,
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

            if (match!.length > 1) {
                const paramsString = match![1].trim();
                const parsedParams = urlParser(paramsString);
                account_id = parsedParams.account_id || 'ecfafe4bc756935e17d93bec';
                from_url = parsedParams.from_url!;
            }

            const isChat = await this.chatsService.getChatByMessengerId(messenger_id);

            if (!isChat) {
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
                    contact_tg_status: true,
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
        console.log('Сообщение из телеги', msg);

        const startCommandRegex = /^\/start/i;
        if (startCommandRegex.test(msg.text)) return;

        if (msg.text && msg.text.length < 2) return;

        const messenger_id = msg.chat.id.toString();
        const messenger_type = 'telegram';

        let account_id: string = 'ecfafe4bc756935e17d93bec';
        let contact_id: string;
        let chat_id: string;
        let contact_photo_url: string;
        let message_value = msg.text || ' '; // Теперь текст всегда есть
        let message;

        let params;

        const isChat = await this.chatsService.getChatByMessengerId(messenger_id);

        // Проверка на наличие существующей переписки

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
                contact_tg_status: true,
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

        const attachments = await this.parseAttachments(msg);
        const message_type = attachments.length > 0 ? 'media' : 'text';

        params = {
            message_value,
            message_type,
            messenger_type: 'telegram',
            manager_id: '',
            contact_id,
            chat_id,
            attachments,
        };
        console.log('params', params);
        console.log('params.attachments', attachments);

        message = await this.messagesService.createMessage(params);

        this.eventGateway.ioServer.emit('update', { message });
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
            console.log('response.data from TG', response.data);
            const imageBuffer = Buffer.from(response.data, 'binary');
            console.log('imageBuffer from TG', imageBuffer);
            return imageBuffer;
        }
        return '';
    };

    downloadAndSaveTgFile = async (file: MessengerAttachment) => {
        try {
            let fileType = file.file_type;
            let fileName = file.file_name || `${fileType}_${Date.now()}`;

            let fileUrl = await tgBot.getFileLink(file.file_id);
            const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });

            const { attachment_src, filePath } = await this.filesService.saveFile(
                response.data,
                fileName,
                fileType,
            );

            return { filePath, attachment_src, fileType };
        } catch (error) {
            console.log(error);
        }
    };

    private async parseAttachments(msg: TelegramBot.Message) {
        try {
            type MediaConfig = {
                [key: string]: {
                    type: string;
                    defaultExt: string;
                    pickLargest?: boolean;
                };
            };
            const mediaConfig: MediaConfig = {
                photo: { type: 'image', defaultExt: '.jpg', pickLargest: true },
                document: { type: 'document', defaultExt: '' },
                audio: { type: 'audio', defaultExt: '.mp3' },
                voice: { type: 'audio', defaultExt: '.ogg' },
                video: { type: 'video', defaultExt: '.mp4' },
                video_note: { type: 'video', defaultExt: '.mp4' },
            };

            let attachments: MessengerAttachments = [];

            for (const [key, config] of Object.entries(mediaConfig)) {
                if (msg[key]) {
                    let filesArray = Array.isArray(msg[key]) ? msg[key] : [msg[key]];

                    if (config.pickLargest && filesArray.length > 1) {
                        filesArray = [
                            filesArray.reduce(
                                (max, file) => (file.file_size > max.file_size ? file : max),
                                filesArray[0],
                            ),
                        ];
                    }

                    for (const file of filesArray) {
                        const fileExt = this.getFileExtension(file.mime_type, config.defaultExt);

                        // Создаем имя файла и проверяем есть ли в нем расширение.
                        let fileName = file.file_name || `${config.type}_${file.file_id}`;
                        if (fileName && !fileName.endsWith(fileExt) && fileExt) {
                            fileName += fileExt;
                        }

                        // Добавляем duration для аудио
                        const fileData: MessengerAttachment = {
                            file_id: file.file_id,
                            file_name: fileName as string,
                            file_extension: fileExt,
                            file_type: config.type,
                            file_size: file.file_size,

                            payload: {
                                duration: undefined, // По умолчанию undefined
                            },
                        };

                        if (file.duration !== undefined) fileData.payload.duration = file.duration;
                        if (file.width !== undefined) fileData.payload.width = file.width;
                        if (file.height !== undefined) fileData.payload.height = file.height;
                        if (file.caption) fileData.payload.caption = file.caption;
                        // Добавляем reply из msg, если есть
                        if (msg.reply_to_message) {
                            fileData.payload.reply_message_id =
                                msg.reply_to_message.message_id.toString();
                            fileData.payload.reply_text = msg.reply_to_message.text;
                        }

                        attachments.push(fileData);
                    }
                }
            }

            return attachments;
        } catch (error) {
            console.log(error);
        }
    }

    // Вспомогательная функция для определения расширения
    private getFileExtension(mimeType: string | undefined, defaultExt: string): string {
        if (!mimeType) return defaultExt;
        const mimeMap = {
            '': '.jpg',
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'audio/mpeg': '.mp3',
            'audio/ogg': '.ogg',
            'video/mp4': '.mp4',
            'application/pdf': '.pdf',
        };
        return mimeMap[mimeType] || defaultExt || '';
    }
}
