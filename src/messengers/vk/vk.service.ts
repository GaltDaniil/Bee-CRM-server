import { Injectable } from '@nestjs/common';
import {
    AudioAttachment,
    AudioMessageAttachment,
    DocumentAttachment,
    LinkAttachment,
    MarketAttachment,
    PhotoAttachment,
    StickerAttachment,
    VideoAttachment,
    VK,
    Keyboard,
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
import { Message } from 'src/messages/messages.model';
import { InjectModel } from '@nestjs/sequelize';
import { customAlphabet } from 'nanoid';
import { AttachmentsService } from 'src/attachments/attachments.service';
import { vkBot } from '../bots.init';
import { autoresponder } from '../chatbot/autoresponder';
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
        private messagesService: MessagesService,
        private attachmentsService: AttachmentsService,
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

        const params = {
            message_value: context.text === undefined ? ' ' : context.text,
            message_type: 'text',
            messenger_type: 'vk',
            manager_id: '',
            contact_id,
            chat_id,
        };

        const message = await this.sendMessageFromVk(params, context.attachments);
        const answerText = autoresponder(message.createdAt);
        /* if (answerText) {
            await this.messagesService.createMessage({ ...params, message_value: answerText });
        } */
    };

    replyMessageHandler = async (context) => {
        console.log('context', context);
        if (context.senderType === 'group') return;

        const messenger_id = context.peerId.toString();
        let chat_id: string;
        let contact_id: string;

        const isChat = await this.chatsService.getChatByMessengerId(messenger_id);
        console.log('isChat', isChat);
        if (!isChat) {
            let account_id: string = 'ecfafe4bc756935e17d93bec';

            let contact_photo_url: string;

            /* if (context.referralValue) {
                const parsedParams = await urlParser(context.referralValue);
                account_id = parsedParams.account_id || 'ecfafe4bc756935e17d93bec';
            } */
            const vkData = await this.VKBot.api.users.get({
                user_ids: [context.senderId],
                fields: ['photo_200_orig', 'nickname'],
            });

            console.log('vkData', vkData);
            const { photo_200_orig, first_name, last_name, nickname } = vkData[0];

            const contact_name: string = first_name + ' ' + last_name || '';
            const messenger_username: string = nickname || '';

            const response = await axios.get(photo_200_orig, { responseType: 'arraybuffer' });
            const avatarFile = Buffer.from(response.data, 'binary');

            console.log('contact_name', contact_name);
            console.log('messenger_username', messenger_username);
            console.log('avatarFile', avatarFile);

            /* const fileName = await this.filesService.saveAvatarFromMessenger(
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
                };

                const newChat = await this.chatsService.createChat(params);
                chat_id = newChat.chat_id;
            }
        } else {
            contact_id = isChat.contact_id;
            chat_id = isChat.chat_id;
        }

        const params = {
            message_value: context.text === undefined ? ' ' : context.text,
            message_type: 'text',
            messenger_type: 'vk',
            manager_id: '',
            contact_id,
            chat_id,
        }; */

            //const message = await this.sendMessageFromVk(params, context.attachments);
        } else {
            contact_id = isChat.contact_id;
            chat_id = isChat.chat_id;
        }
        const params = {
            message_value: context.text === undefined ? ' ' : context.text,
            message_type: 'text',
            messenger_type: '',
            manager_id: context.senderId,
            messenger_id,
            contact_id,
            chat_id,
        };

        const message = await this.messagesService.createMessage(params);
        console.log('context.attachments)', context.attachments);

        if (context.attachments) {
            this.chechAttachments(context.attachments, message.chat_id, message.message_id);
        }
    };

    sendMessageFromVk = async (params, attachments?) => {
        console.log('sendMessageFromVk params', params);
        console.log('sendMessageFromVk attachments', attachments);
        const message = await this.messagesService.createMessage(params);

        if (attachments) {
            this.chechAttachments(attachments, message.chat_id, message.message_id);
        }
        this.eventGateway.ioServer.emit('update', message);

        return message;
    };

    chechAttachments = (attachments, chat_id?, message_id?) => {
        let attachmentData;
        for (const attachment of attachments) {
            if (attachment instanceof MarketAttachment) {
                const attachmentWithType = attachment as MarketAttachment;
                const attachment_market = {
                    price: attachmentWithType.price.text,
                    title: attachmentWithType.title,
                    description: attachmentWithType.description,
                    photo_url: attachmentWithType.thumbnailUrl,
                };
                const params = {
                    attachment_name: attachmentWithType.title,
                    attachment_src: attachmentWithType.thumbnailUrl,
                    attachment_type: 'market',
                    attachment_url: ' ',
                    attachment_market,
                    chat_id,
                    message_id,
                };

                attachmentData = this.attachmentsService.createAttachment(params, '');
            } else if (attachment instanceof PhotoAttachment) {
                console.log('Да, это фоточка');
                const attachmentWithType = attachment as PhotoAttachment;
                const attachment_url = attachment.sizes.find((size) => size.type === 'x')?.url; // Выбираем URL среднего размера изображения
                const params = {
                    attachment_name: attachmentWithType.id.toString(),
                    attachment_src: attachment_url,
                    attachment_type: 'image',
                    attachment_url,
                    attachment_market: {},
                    chat_id,
                    message_id,
                };
                attachmentData = this.attachmentsService.createAttachment(params, '');
                /* if (photoUrl) {
                        // Сохраняем фото на сервере или выполняем другие действия
                        const savedPhoto = await this.saveAttachment(photoUrl);
                        console.log('Сохраненное фото:', savedPhoto);
                    } */
            } else if (attachment instanceof AudioMessageAttachment) {
                console.log('Да, это голосовое');
                // Если вложение - аудио
                // Обработка аудиофайла, сохранение на сервере и т.д.
            } else if (attachment instanceof VideoAttachment) {
                console.log('Да, видео сообщение');
                // Если вложение - аудио
                // Обработка аудиофайла, сохранение на сервере и т.д.
            } else if (attachment instanceof DocumentAttachment) {
                console.log('Да, это сообщение с документом');
                // Если вложение - аудио
                // Обработка аудиофайла, сохранение на сервере и т.д.
            } else if (attachment instanceof StickerAttachment) {
                console.log('Да, стикер');
                // Если вложение - аудио
                // Обработка аудиофайла, сохранение на сервере и т.д.
            } else if (attachment instanceof LinkAttachment) {
                console.log('Да, это ссылка');
                // Если вложение - аудио
                // Обработка аудиофайла, сохранение на сервере и т.д.
            } else if (attachment instanceof AudioAttachment) {
                console.log('Да, аудио сообщение');
                // Если вложение - аудио
                // Обработка аудиофайла, сохранение на сервере и т.д.
            }

            // Другие типы вложений можно обработать аналогичным образом
            return attachmentData;
        }
    };
}
