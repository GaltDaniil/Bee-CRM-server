import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
    VK,
    Keyboard,
    MarketAttachment,
    PhotoAttachment,
    AudioMessageAttachment,
    VideoAttachment,
    DocumentAttachment,
    StickerAttachment,
    LinkAttachment,
    AudioAttachment,
} from 'vk-io';
import { ChatsService } from 'src/chats/chats.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { FilesService } from 'src/files/files.service';
import { MessagesService } from 'src/messages/messages.service';
import * as dotenv from 'dotenv';
import { urlParser } from '../middleware/urlParser';
import axios from 'axios';
import { Contact } from 'src/contacts/contacts.model';
import { EventGateway } from 'src/event/event.gateway';
import { customAlphabet } from 'nanoid';
import { vkBot } from '../bots.init';
import * as fs from 'fs';
import * as path from 'path';
import { error } from 'console';
import { MessengerAttachment, MessengerAttachments } from 'src/attachments/dto/attachment.dto';
const nanoid = customAlphabet('abcdef123456789', 24);

dotenv.config();

const createKeyboard = () => {
    return Keyboard.builder()
        .textButton({
            label: 'Button 1',
            payload: { command: 'button1' },
            color: Keyboard.PRIMARY_COLOR,
        })
        .textButton({
            label: 'Button 2',
            payload: { command: 'button2' },
            color: Keyboard.SECONDARY_COLOR,
        })
        .inline();
};

@Injectable()
export class VkService {
    constructor(
        private contactsService: ContactsService,
        private chatsService: ChatsService,
        @Inject(forwardRef(() => MessagesService)) private messagesService: MessagesService,
        private filesService: FilesService,
        private eventGateway: EventGateway,
    ) {}
    VKBot: VK;

    init() {
        console.log('init стартанул');
        this.VKBot = vkBot;
        console.log('this.VKBot ', this.VKBot);

        vkBot.updates.on('group_join', (context) => {
            console.log('group_join', context);
        });

        vkBot.updates.on('message_new', this.newMessageHandler);

        vkBot.updates.on('message_reply', this.replyMessageHandler);

        vkBot.updates
            .start()
            .then(() => {
                console.log('VK бот запущен и слушает сообщения...'); // Логируем успешный запуск
            })
            .catch((error) => {
                console.error('Ошибка при запуске VK бота:', error); // Логируем ошибку
            });
    }

    newMessageHandler = async (context) => {
        console.log('messageHandler', context);

        if (context.text !== undefined) {
            if (context.text.length < 2 && context.attachment.length == 0) return;
            if (context.text === 'начать' || context.text === 'Начать') return;
        }
        const messenger_id = context.senderId.toString();
        let chat_id: string;
        let contact_id: string;
        let attachments: MessengerAttachments = [];

        const isChat = await this.chatsService.getChatByMessengerId(messenger_id);
        if (!isChat) {
            let account_id: string = 'ecfafe4bc756935e17d93bec';

            let contact_photo_url: string;
            let from_url;

            if (context.referralValue) {
                const parsedParams = await urlParser(context.referralValue);
                account_id = parsedParams.account_id || 'ecfafe4bc756935e17d93bec';
                from_url = parsedParams.from_url || '';
            }
            const vkData = await this.VKBot.api.users.get({
                user_ids: [context.senderId],
                fields: ['photo_200_orig', 'nickname'],
            });
            const { photo_200_orig, first_name, last_name, nickname } = vkData[0];

            const contact_name: string = first_name + ' ' + last_name || '';
            const messenger_username: string = nickname || '';

            const response = await axios.get(photo_200_orig, { responseType: 'arraybuffer' });
            const avatarFile = Buffer.from(response.data, 'binary');

            const fileName = await this.filesService.saveAvatarFromMessenger(
                avatarFile,
                messenger_id,
            );
            contact_photo_url = fileName;

            const params = {
                account_id,
                contact_name,
                contact_photo_url,
                contact_vk_status: true,
            };
            const newContact: Contact = await this.contactsService.createContact(params);

            if (newContact) {
                contact_id = newContact.contact_id;
                const params = {
                    contact_id,
                    messenger_id,
                    messenger_type: 'vk',
                    messenger_username,
                    from_url,
                };

                const newChat = await this.chatsService.createChat(params);
                chat_id = newChat.chat_id;
            }
        } else {
            contact_id = isChat.contact_id;
            chat_id = isChat.chat_id;
        }

        if (context.attachments && context.attachments.length > 0) {
            attachments = await this.vkAttachmentsParser(
                context.attachments,
                context.from,
                messenger_id,
            );
        }

        const params = {
            message_value: context.text === undefined ? ' ' : context.text,
            message_type: 'text',
            messenger_type: 'vk',
            manager_id: '',
            contact_id,
            chat_id,
            attachments: attachments,
        };

        const message = await this.messagesService.createMessage(params);

        this.eventGateway.ioServer.emit('update', message);

        /* const answerText = autoresponder(message.createdAt); */
        /* if (answerText) {
            await this.messagesService.createMessage({ ...params, message_value: answerText });
        } */
    };

    replyMessageHandler = async (context) => {
        console.log('replyMessageHandler', context);

        let chat_id: string;
        let contact_id: string;
        let manager_id: string;
        let message_from;

        if (context.senderType === 'group') {
            return;
        } else {
            manager_id = String(context.senderId);
            message_from = 'main';
        }

        const messenger_id = String(context.peerId);

        //const members = await this.getManagersId(context.senderId);

        const isChat = await this.chatsService.getChatByMessengerId(messenger_id);

        if (isChat) {
            contact_id = isChat.contact_id;
            chat_id = isChat.chat_id;
        } else {
            console.log('чат не найден');
            throw error;
        }

        /* if (!isChat) {
            let account_id: string = 'ecfafe4bc756935e17d93bec';

            let contact_photo_url: string;
            let from_url;

            if (context.referralValue) {
                const parsedParams = await urlParser(context.referralValue);
                account_id = parsedParams.account_id || 'ecfafe4bc756935e17d93bec';
                from_url = parsedParams.from_url || '';
            }
            const vkData = await this.VKBot.api.users.get({
                user_ids: [context.senderId],
                fields: ['photo_200_orig', 'nickname'],
            });
            const { photo_200_orig, first_name, last_name, nickname } = vkData[0];

            const contact_name: string = first_name + ' ' + last_name || '';
            const messenger_username: string = nickname || '';

            const response = await axios.get(photo_200_orig, { responseType: 'arraybuffer' });
            const avatarFile = Buffer.from(response.data, 'binary');

            const fileName = await this.filesService.saveAvatarFromMessenger(
                avatarFile,
                messenger_id,
            );
            contact_photo_url = fileName;

            const params = {
                account_id,
                contact_name,
                contact_photo_url,
                contact_vk_status: true,
            };
            const newContact: Contact = await this.contactsService.createContact(params);

            if (newContact) {
                contact_id = newContact.contact_id;
                const params = {
                    contact_id,
                    messenger_id,
                    messenger_type: 'vk',
                    messenger_username,
                    from_url,
                };

                const newChat = await this.chatsService.createChat(params);
                chat_id = newChat.chat_id;
            }
        } else {
            contact_id = isChat.contact_id;
            chat_id = isChat.chat_id;
        } */

        const params = {
            message_value: context.text === undefined ? ' ' : context.text,
            message_type: 'text',
            messenger_type: 'vk',
            message_from,
            manager_id,
            messenger_id,
            attachments: context.attachments ? context.attachments : [],
            contact_id,
            chat_id,
        };

        const message = await this.messagesService.createMessage(params);

        /* if (context.attachments) {
            this.chechAttachments(context.attachments, message.chat_id, message.message_id);
        } */
    };

    async getManagersId(senderId) {
        const groups = await vkBot.api.groups.getById({});
        //@ts-ignore
        const groupId = groups.groups[0].id;
        const admins = await vkBot.api.groups.getMembers({
            group_id: groupId,
            filter: 'managers',
        });

        console.log('admins', admins);

        console.log(admins.items);
        //@ts-ignore
        return admins.items.some((admin) => String(admin.id) === String(senderId));
    }

    async uploadAndSendDocument(filePath: string, peer_id: number) {
        try {
            console.log('uploadDocument отработал на входе ', filePath);

            // Загружаем документ на сервер ВК
            const doc = await vkBot.upload.messageDocument({
                source: {
                    value: fs.createReadStream(filePath), // Поток файла
                    filename: path.basename(filePath),
                },
                title: path.basename(filePath),
                peer_id, // Обязательно нужен для загрузки
            });

            const vkAttachment = `doc${doc.ownerId}_${doc.id}`;

            await vkBot.api.messages.send({
                peer_id: peer_id,
                attachment: vkAttachment,
                random_id: Math.floor(Math.random() * 1000000),
            });

            return { url: doc.url, extension: doc.extension };
        } catch (error) {
            console.error('Ошибка при загрузке документа:', error);
            throw error;
        }
    }

    async vkAttachmentsParser(
        attachments,
        message_from,
        messenger_id,
    ): Promise<MessengerAttachments> {
        console.log('message_from', message_from);

        try {
            const mediaConfig = {
                photo: { type: 'image', defaultExt: '.jpg', pickLargest: true },
                video: { type: 'video', defaultExt: '.mp4' },
                audio: { type: 'audio', defaultExt: '.mp3' },
                audio_message: { type: 'audio', defaultExt: '.mp3' },
                doc: { type: 'document', defaultExt: '' },
                market: { type: 'market', defaultExt: '.jpg' },
                sticker: { type: 'sticker', defaultExt: '.png' },
                link: { type: 'link', defaultExt: '' },
            };
            const result: MessengerAttachment[] = [];
            let params: MessengerAttachment;

            for (const attachment of attachments) {
                if (attachment instanceof MarketAttachment) {
                    params = {
                        file_id: `market_${attachment.id}_${attachment.ownerId}`,
                        file_name: attachment.title,
                        file_extension: '.jpg', // Обычно thumbnail — это изображение
                        file_type: 'market',
                        file_size: undefined,
                        payload: {
                            price: attachment.price.text,
                            title: attachment.title,
                            description: attachment.description,
                            photo_url: attachment.thumbnailUrl,
                        },
                    };
                } else if (attachment instanceof PhotoAttachment) {
                    const largestSize = attachment.sizes.reduce(
                        (max, size) => (size.width > max.width ? size : max),
                        attachment.sizes[0],
                    );
                    params = {
                        file_id: `photo_${attachment.id}_${attachment.ownerId}`,
                        file_name: `photo_${attachment.id}_${attachment.ownerId}.jpg`,
                        file_extension: '.jpg',
                        file_type: 'image',
                        file_size: largestSize.width * largestSize.height, // Примерный размер
                        payload: {
                            width: largestSize.width,
                            height: largestSize.height,
                        },
                    };
                } else if (attachment instanceof AudioMessageAttachment) {
                    params = {
                        file_id: `audio_message_${attachment.id}_${attachment.ownerId}`,
                        file_name: `audio_message_${attachment.id}_${attachment.ownerId}.mp3`,
                        file_extension: '.mp3',
                        file_type: 'audio',
                        file_size: attachment.duration * 32000, // Примерный размер (320kbps)
                        payload: {
                            duration: attachment.duration,
                        },
                    };
                } else if (attachment instanceof VideoAttachment) {
                    /* params = {
                        file_id: `video_${attachment.id}_${attachment.ownerId}`,
                        file_name:
                            attachment.title || `video_${attachment.id}_${attachment.ownerId}.mp4`,
                        file_extension: '.mp4',
                        file_type: 'video',
                        file_size: attachment.fileSize,
                        payload: {
                            duration: attachment.duration,
                            width: attachment.width,
                            height: attachment.height,
                        },
                    }; */
                } else if (attachment instanceof DocumentAttachment) {
                    const fileExt =
                        attachment.extension || this.getFileExtensionFromUrl(attachment.url) || '';
                    params = {
                        file_id: `doc_${attachment.id}_${attachment.ownerId}`,
                        file_name: attachment.title,
                        file_extension: fileExt,
                        file_type: 'document',
                        file_size: attachment.size,
                        payload: {},
                    };
                } else if (attachment instanceof StickerAttachment) {
                    params = {
                        file_id: `sticker_${attachment.id}`,
                        file_name: `sticker_${attachment.id}.png`,
                        file_extension: '.png',
                        file_type: 'sticker',
                        file_size: undefined,
                        payload: {},
                    };
                } else if (attachment instanceof LinkAttachment) {
                    params = {
                        file_id: `link_${attachment.url}`,
                        file_name: attachment.title || attachment.url,
                        file_extension: '',
                        file_type: 'link',
                        file_size: undefined,
                        payload: {
                            caption: attachment.description || attachment.title,
                        },
                    };
                } else if (attachment instanceof AudioAttachment) {
                    params = {
                        file_id: `audio_${attachment.id}_${attachment.ownerId}`,
                        file_name:
                            attachment.title || `audio_${attachment.id}_${attachment.ownerId}.mp3`,
                        file_extension: '.mp3',
                        file_type: 'audio',
                        file_size: undefined,
                        payload: {
                            duration: attachment.duration,
                        },
                    };
                } else if (message_from === 'crm') {
                    console.log('Да, сообщение получено из CRM');

                    const tempFilePath = await this.filesService.tempFiles(attachment);
                    console.log('tempFilePath', tempFilePath);
                    const { url, extension } = await this.uploadAndSendDocument(
                        tempFilePath,
                        messenger_id,
                    );

                    params = {
                        file_name: attachment.originalname,
                        file_src: url,
                        file_type: 'document',
                        file_extension: attachment.extension || extension,
                    };
                }

                if (params) {
                    result.push(params);
                }
            }
            return result;
        } catch (error) {
            console.error('Ошибка при разборе вложений:', error);
            throw error;
        }
    }
    private getFileExtensionFromUrl(url: string): string {
        const match = url.match(/\.([a-z0-9]+)(?:[?#]|$)/i);
        return match ? `.${match[1].toLowerCase()}` : '';
    }

    private getFileExtension(mimeType: string, defaultExt: string): string {
        const mimeMap: { [key: string]: string } = {
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
