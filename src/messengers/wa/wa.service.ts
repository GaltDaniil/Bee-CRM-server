import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { ChatsService } from 'src/chats/chats.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { EventGateway } from 'src/event/event.gateway';
import { FilesService } from 'src/files/files.service';
import { MessagesService } from 'src/messages/messages.service';
import { SocketWhatsapp } from 'src/event/event.adapter';
import * as qrcode from 'qrcode-terminal';

import { Client, Message, MessageMedia } from 'whatsapp-web.js';
import axios from 'axios';
import { autoresponder } from '../chatbot/autoresponder';
import { WaFromGetcourse } from './dto/wa-from-getcourse.dto';
import { GetcourseService } from 'src/integration/getcourse/getcourse.service';
import { AttachmentsService } from 'src/attachments/attachments.service';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('abcdef123456789', 24);

interface IncomingMessage {
    from: string;
    body?: string;
    to?: string;
    id: string;
    name: string;
    manager_id?: string;
    check: string;
    hasMedia?: boolean;
    attachments?: {
        mimeType: string;
        data: string; // base64
        filename: string;
    };
}

interface MessageParams {
    message_value: string;
    message_type: string;
    message_from: string;
    messenger_type: string;
    manager_id: string;
    contact_id: string;
    chat_id: string;
    attachments: any;
}

@Injectable()
export class WaService {
    private socket: Socket;

    constructor(
        private contactsService: ContactsService,
        private chatsService: ChatsService,
        private eventGateway: EventGateway,
        private getcourseService: GetcourseService,
        @Inject(forwardRef(() => MessagesService)) private messagesService: MessagesService,
    ) {
        const socketInstance = SocketWhatsapp.getInstance();
        this.socket = socketInstance.getSocket();
        this.initListeners();
    }

    private initListeners() {
        this.socket.on('message', async (data: IncomingMessage) => {
            const params = {
                check: data.from,
                to: data.to,
                from: data.from,
                manager_id: '',
                body: data.body,
                name: data.name,
                id: data.id,
                attachments: data.attachments,
            };
            await this.processIncomingMessage(params);
        });
        this.socket.on('message_from_main', async (data: IncomingMessage) => {
            const params = {
                check: data.to,
                to: data.to,
                from: data.from,
                manager_id: 'main',
                body: data.body,
                name: data.name,
                id: data.id,
                attachments: data.attachments,
            };
            await this.processIncomingMessage(params);
        });
    }

    private async processIncomingMessage(data: IncomingMessage) {
        try {
            const {
                check: messenger_id,
                body: message_value,
                manager_id,
                hasMedia,
                name,
                attachments,
            } = data;

            // Проверяем, существует ли уже чат
            let chat = await this.chatsService.getChatByMessengerId(messenger_id);
            if (!chat) {
                chat = await this.createNewChat(messenger_id, name ? name : messenger_id);
            } else {
                console.log('Чат уже есть');
            }

            if (!chat) {
                console.error(`❌ Не удалось создать чат для ${messenger_id}`);
                return;
            }

            // Подготовка параметров сообщения
            const messageParams: MessageParams = {
                message_value,
                message_type: hasMedia ? 'image' : 'text',
                message_from: 'wa',
                messenger_type: 'wa',
                manager_id,
                contact_id: chat.contact_id,
                chat_id: chat.chat_id,
                attachments: attachments,
            };

            // Сохранение сообщения
            const message = await this.createMessageFromWa(messageParams);
            return message;
        } catch (error) {
            console.error('❌ Ошибка при обработке входящего сообщения:', error);
            throw error;
        }
    }

    private async createNewChat(messenger_id: string, contact_name?: string) {
        try {
            const account_id = 'ecfafe4bc756935e17d93bec';
            const phoneNumber = messenger_id.split('@')[0];
            // Создаём контакт
            const newContact = await this.contactsService.createContact({
                account_id,
                contact_name,
                contact_photo_url: '',
                contact_phone: phoneNumber ? phoneNumber : '',
            });

            if (!newContact) {
                throw new Error(`Не удалось создать контакт для ${messenger_id}`);
            }

            // Создаём чат
            const newChat = await this.chatsService.createChat({
                contact_id: newContact.contact_id,
                messenger_id,
                messenger_type: 'wa',
            });

            return newChat;
        } catch (error) {
            console.error(`❌ Ошибка при создании чата для ${messenger_id}:`, error);
            return null;
        }
    }

    private async createMessageFromWa(params: MessageParams) {
        try {
            const message = await this.messagesService.createMessage(params);
            this.eventGateway.ioServer.emit('update', message);
            return message;
        } catch (error) {
            console.error('❌ Ошибка при сохранении сообщения:', error);
        }
    }

    public async sendMessage(messenger_id, message_value, attachments?) {
        try {
            console.log(
                'сообщение получено в sendMessage на основе',
                messenger_id,
                message_value,
                attachments,
            );
            // Добавляем проверку размера файлов перед отправкой
            const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
            for (const attachment of attachments) {
                if (attachment.size > MAX_FILE_SIZE) {
                    throw new Error(
                        `Файл ${attachment.filename} превышает максимальный размер ${MAX_FILE_SIZE} байт`,
                    );
                }
            }

            this.socket.emit('sendMessage', {
                messenger_id,
                message_value,
                attachments,
            });
        } catch (error) {
            console.error('❌ Ошибка при отправки wa сообщения по сокету', error);
        }
    }
    public async sendMessageWithAttachments(
        messenger_id,
        baffer,
        filename,
        mimeType,
        message_value?,
    ) {
        try {
            console.log('отправка сообщения с вложением в WA', messenger_id, message_value);
            this.socket.emit('sendMessageWithAttachments', { messenger_id, message_value });
        } catch (error) {
            console.error('❌ Ошибка при отправки wa сообщения по сокету', error);
        }
    }

    formatPhoneNumber(phoneNumber: string): string {
        phoneNumber = phoneNumber.replace(/\s/g, '');
        if (phoneNumber.startsWith('+')) {
            phoneNumber = phoneNumber.slice(1);
        }
        if (phoneNumber.startsWith('8')) {
            phoneNumber = `7${phoneNumber.slice(1)}`;
        }
        return phoneNumber;
    }

    checkPhoneNumber = async (phoneNumber) => {
        return new Promise((resolve, reject) => {
            this.socket.emit('checkPhoneNumber', phoneNumber, (response) => {
                if (response.status === 'success') {
                    resolve(response.isRegistered);
                } else {
                    reject(response.message);
                }
            });
        });
    };

    checkWaNumber2 = async (contact_phone, contact_id) => {
        const convertedNumber = this.formatPhoneNumber(contact_phone);

        try {
            const chatId = `${convertedNumber}@c.us`; // Форматируем номер в нужный формат
            const isRegistered = await this.checkPhoneNumber(chatId);
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
        const convertedNumber = this.formatPhoneNumber(contact_phone);

        try {
            const chatId = `${convertedNumber}@c.us`; // Форматируем номер в нужный формат
            const isRegistered = await this.checkPhoneNumber(chatId);
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

    async newMessageFromGetcourse(dto: WaFromGetcourse) {
        try {
            let contact = await this.contactsService.getOneContactByEmail(dto.contact_email);
            if (!contact) {
                const contactParams = {
                    contact_name: dto.contact_name,
                    contact_photo_url: '',
                    contact_phone: dto.contact_phone,
                    contact_email: dto.contact_email,
                    account_id: '',
                };
                contact = await this.contactsService.createContact(contactParams);
            }

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
            }

            const messageParams = {
                chat_id: chat.chat_id,
                message_value: dto.message_value,
                message_type: dto.message_type,
                messenger_type: dto.messenger_type,
                messenger_id: dto.messenger_id,
                contact_id: contact.contact_id,
                manager_id: dto.manager_id,
                attachments: dto.attachments,
            };
            //@ts-ignore
            await this.createMessageFromWa(messageParams);
            await this.getcourseService.updateGetcourseUserByEmail(dto.contact_email, chat.chat_id);
        } catch (error) {
            console.log(error);
        }
    }
}
