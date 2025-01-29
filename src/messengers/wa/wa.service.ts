import { Injectable } from '@nestjs/common';
import { ChatsService } from 'src/chats/chats.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { EventGateway } from 'src/event/event.gateway';
import { FilesService } from 'src/files/files.service';
import { MessagesService } from 'src/messages/messages.service';
import { waBot } from '../bots.init';
import * as qrcode from 'qrcode-terminal';

import { Client, Message } from 'whatsapp-web.js';
import axios from 'axios';
import { autoresponder } from '../chatbot/autoresponder';
import { WaFromGetcourse } from './dto/wa-from-getcourse.dto';
import { GetcourseService } from 'src/integration/getcourse/getcourse.service';
import { AttachmentsService } from 'src/attachments/attachments.service';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('abcdef123456789', 24);

@Injectable()
export class WaService {
    constructor(
        private contactsService: ContactsService,
        private messagesService: MessagesService,
        private chatsService: ChatsService,
        private filesService: FilesService,
        private eventGateway: EventGateway,
        private getcourseService: GetcourseService,
        private attachmentsService: AttachmentsService,
    ) {}
    whatsappBot: Client;

    init() {
        this.whatsappBot = waBot;
        this.whatsappBot.on('qr', async (qr: string) => {
            // Вывод QR-кода в текстовом формате
            qrcode.generate(qr, { small: true });
        });
        this.whatsappBot.on('ready', () => {
            console.log('WhatsApp Web is run!');
        });

        this.whatsappBot.on('message_create', async (msg: Message) => {
            console.log(msg);
            if (msg.from === '79964390394@c.us') {
                return;
            }
            if (msg.body !== undefined) {
                if (msg.body.length < 2 && msg.hasMedia === false) {
                    return;
                }
            }
            const contact = await msg.getContact();
            //const profilePicUrl = await contact.getProfilePicUrl();

            let chat_id: string;
            let contact_id: string;
            const messenger_type = 'wa';
            const message_value = msg.body;

            const messenger_id = msg.from;
            const isChat = await this.chatsService.getChatByMessengerId(messenger_id);
            if (!isChat) {
                //создаем новый чат, но нужно еще проверить пользователя.
                let account_id: string = 'ecfafe4bc756935e17d93bec';
                const contact_name = contact.pushname;

                let contact_photo_url = '';
                const profilePicUrl = await contact.getProfilePicUrl();
                if (profilePicUrl) {
                    const response = await axios.get(profilePicUrl, {
                        responseType: 'arraybuffer',
                    });
                    const avatarFile = Buffer.from(response.data, 'binary');
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
                const newContact = await this.contactsService.createContact(params);
                if (newContact) {
                    contact_id = newContact.contact_id;
                    const params = {
                        contact_id,
                        messenger_id,
                        messenger_type,
                    };

                    const newChat = await this.chatsService.createChat(params);
                    chat_id = newChat.chat_id;
                }
            } else {
                contact_id = isChat.contact_id;
                chat_id = isChat.chat_id;
            }
            // ЗДЕСЬ НУЖНО ПРОВЕРИТЬ НА НАЛИЧИЕ ИЗОБРАЖЕНИЯ

            const params = {
                message_value,
                message_type: 'text',
                messenger_type,
                manager_id: '',
                contact_id,
                chat_id,
            };

            const message = await this.sendMessageFromWa(params);

            /* const answerText = autoresponder(message.createdAt);
            if (answerText) {
                await this.messagesService.createMessage({ ...params, message_value: answerText });
            } */
            await this.checkImageAttachment(msg, message.message_id);
        });
        this.whatsappBot.initialize();
    }
    sendMessageFromWa = async (params, attachments?) => {
        const message = await this.messagesService.createMessage(params);
        this.eventGateway.ioServer.emit('update', message);
        return message;
    };

    checkImageAttachment = async (msg: Message, message_id: string) => {
        if (msg.hasMedia) {
            const media = await msg.downloadMedia();
            console.log('media', media);
            const mediaExtension = media.mimetype.split('/')[1]; // Получаем расширение файла
            const fileBuffer = Buffer.from(media.data, 'base64');

            const savedFile = await this.filesService.saveChatImage(fileBuffer, mediaExtension);
            const fileName = media.filename ? media.filename : nanoid();

            const attachmentParams = {
                message_id,
                attachment_name: fileName,
                attachment_url: `assets/images/chats/${savedFile.fileName}`,
                attachment_type: media.mimetype.startsWith('image') ? 'image' : 'file',
                attachment_src: `https://beechat.ru/assets/images/chats/${savedFile.fileName}`,
                attachment_market: {}, // если нужен маркетинговый параметр
            };

            await this.attachmentsService.createAttachment(attachmentParams, savedFile.filePath);
        }
    };
    checkWaNumber = async (contact_phone, contact_id) => {
        const convertedNumber = this.formatPhoneNumber(contact_phone);

        try {
            //const numberId = await this.whatsappBot.getNumberId(convertedNumber);
            //console.log('numberId', numberId);
            const chatId = `${convertedNumber}@c.us`; // Форматируем номер в нужный формат
            const isRegistered = await this.whatsappBot.isRegisteredUser(chatId);
            console.log('isRegistered', isRegistered);

            if (isRegistered) {
                console.log(`номер ${contact_phone} зарегистрирован в WhatsApp `);
                const chat = await this.chatsService.createChatByContact({
                    contact_id,
                    messenger_id: chatId,
                    messenger_type: 'wa',
                });
                if (chat) {
                    await this.contactsService.updateContact({
                        contact_id,
                        contact_wa_status: true,
                    });
                    return { contact_wa_status: true, chat_id: chat.chat_id };
                }
            } else {
                console.log(`Номер ${contact_phone} не зарегистрирован в WhatsApp`);
                await this.contactsService.updateContact({
                    contact_id,
                    contact_wa_status: false,
                });
                return { contact_wa_status: false };
            }
            return isRegistered;
        } catch (error) {
            console.error(`Ошибка при проверке номера ${convertedNumber}:`, error);
        }
    };

    checkNumber = async (contact_phone) => {
        console.log('contact_phone', contact_phone);
        const convertedNumber = this.formatPhoneNumber(contact_phone);
        console.log('convertedNumber', convertedNumber);

        try {
            const chatId = `${convertedNumber}@c.us`; // Форматируем номер в нужный формат
            console.log('chatId', chatId);
            const isRegistered = await this.whatsappBot.isRegisteredUser(chatId);
            console.log('isRegistered', isRegistered);

            if (isRegistered) {
                console.log(`номер ${contact_phone} зарегистрирован в WhatsApp `);
                return { status: true, messenger_id: chatId };
            } else {
                console.log(`Номер ${contact_phone} не зарегистрирован в WhatsApp`);

                return { status: false, messenger_id: '' };
            }
        } catch (error) {
            console.error(`Ошибка при проверке номера ${convertedNumber}:`, error);
        }
    };

    newMessageFromGetcourse = async (dto: WaFromGetcourse) => {
        try {
            // Проверяем наличие контакта
            let contact = await this.contactsService.getOneContactByEmail(dto.contact_email);

            // Если контакт отсутствует, создаем его
            if (!contact) {
                const contactParams = {
                    contact_name: dto.contact_name,
                    contact_photo_url: '',
                    contact_phone: dto.contact_phone,
                    contact_email: dto.contact_email,
                    account_id: '',
                };
                contact = await this.contactsService.createContact(contactParams);

                if (!contact) {
                    console.log('Контакт не создался');
                    return;
                }
            }

            // Находим существующий чат или создаем новый
            let chat;
            if (contact.chats) {
                chat = contact.chats.find((chat) => chat.messenger_id === dto.messenger_id);
            }

            if (!chat) {
                const chatParams = {
                    contact_id: contact.contact_id,
                    messenger_id: dto.messenger_id,
                    messenger_type: dto.messenger_type,
                };
                chat = await this.chatsService.createChatByContact(chatParams);

                if (!chat) {
                    console.log('Чат не создался');
                    return;
                }
            }

            // Отправляем сообщение
            const messageParams = {
                chat_id: chat.chat_id,
                message_value: dto.message_value,
                message_type: dto.message_type,
                messenger_type: dto.messenger_type,
                messenger_id: dto.messenger_id,
                contact_id: contact.contact_id,
                manager_id: dto.manager_id,
            };
            await this.sendMessageFromWa(messageParams);
            await this.getcourseService.updateGetcourseUserByEmail(dto.contact_email, chat.chat_id);
        } catch (error) {
            console.log(error);
        }
    };

    formatPhoneNumber(phoneNumber: string): string {
        // Удаление всех пробелов из номера телефона
        phoneNumber = phoneNumber.replace(/\s/g, '');

        // Удаление символа + из начала строки, если он есть
        if (phoneNumber.startsWith('+')) {
            phoneNumber = phoneNumber.slice(1);
        }

        // Проверка и добавление кода страны +7, если его нет
        if (phoneNumber.startsWith('8')) {
            phoneNumber = `7${phoneNumber.slice(1)}`;
        }

        return phoneNumber;
    }
}
