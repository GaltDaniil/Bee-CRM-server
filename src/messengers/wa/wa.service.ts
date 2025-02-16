import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { ChatsService } from 'src/chats/chats.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { EventGateway } from 'src/event/event.gateway';
import { FilesService } from 'src/files/files.service';
import { MessagesService } from 'src/messages/messages.service';
import { SocketWhatsapp } from 'src/event/event.adapter';
import * as qrcode from 'qrcode-terminal';

import { Client, Message } from 'whatsapp-web.js';
import axios from 'axios';
import { autoresponder } from '../chatbot/autoresponder';
import { WaFromGetcourse } from './dto/wa-from-getcourse.dto';
import { GetcourseService } from 'src/integration/getcourse/getcourse.service';
import { AttachmentsService } from 'src/attachments/attachments.service';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('abcdef123456789', 24);

interface IncomingMessage {
    from: string;
    to: string;
    body: string;
    check: string;
    id: string;
    manager_id: string;
}

interface MessageParams {
    message_value: string;
    message_type: string;
    messenger_type: string;
    manager_id: string;
    contact_id: string;
    chat_id: string;
}

@Injectable()
export class WaService {
    private socket: Socket;

    constructor(
        private contactsService: ContactsService,
        private chatsService: ChatsService,
        private filesService: FilesService,
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
            console.log('пришло сообщение по событию message на основной сервер', data);
            const params = {
                check: data.from,
                to: data.to,
                from: data.from,
                manager_id: '',
                body: data.body,
                id: data.id,
            };
            await this.processIncomingMessage(params);
        });
        this.socket.on('message_from_main', async (data: IncomingMessage) => {
            console.log('пришло сообщение по событию message_create на основной сервер', data);
            const params = {
                check: data.to,
                to: data.to,
                from: data.from,
                manager_id: 'main',
                body: data.body,
                id: data.id,
            };
            await this.processIncomingMessage(params);
        });
    }

    private async processIncomingMessage(data: IncomingMessage) {
        try {
            const { check: messenger_id, body: message_value, manager_id } = data;

            // Проверяем, существует ли уже чат
            let chat = await this.chatsService.getChatByMessengerId(messenger_id);
            if (!chat) {
                console.log('Чата нет - создаем');
                chat = await this.createNewChat(messenger_id);
            } else {
                console.log('Чат уже есть');
            }

            // Если по каким-то причинам чат не был создан – логируем и выходим
            if (!chat) {
                console.error(`❌ Не удалось создать чат для ${messenger_id}`);
                return;
            }

            // Сохранение сообщения
            const messageParams: MessageParams = {
                message_value,
                message_type: 'text',
                messenger_type: 'wa',
                manager_id,
                contact_id: chat.contact_id,
                chat_id: chat.chat_id,
            };

            await this.createMessageFromWa(messageParams);
        } catch (error) {
            console.error('❌ Ошибка при обработке входящего сообщения:', error);
        }
    }

    private async createNewChat(messenger_id: string) {
        try {
            const account_id = 'ecfafe4bc756935e17d93bec';
            const contact_name = messenger_id;

            // Создаём контакт
            const newContact = await this.contactsService.createContact({
                account_id,
                contact_name,
                contact_photo_url: '',
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

    public async sendMessage(messenger_id, message_value) {
        try {
            console.log('сообщение получено в sendMessage', messenger_id, message_value);
            this.socket.emit('sendMessage', { messenger_id, message_value });
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
            };
            await this.createMessageFromWa(messageParams);
            await this.getcourseService.updateGetcourseUserByEmail(dto.contact_email, chat.chat_id);
        } catch (error) {
            console.log(error);
        }
    }
}
/* private initSocket() {
        
        // Обработка входящих сообщений
        this.socket.on('message', async (data: { from: string; body: string; id: string }) => {
            console.log('📩 Received message:', data.body);

            // Логика обработки входящих сообщений
            const messenger_id = data.from;
            const message_value = data.body;

            const isChat = await this.chatsService.getChatByMessengerId(messenger_id);
            let chat_id: string;
            let contact_id: string;

            if (!isChat) {
                // Создание нового чата и контакта
                const account_id = 'ecfafe4bc756935e17d93bec'; // Пример account_id
                const contact_name = messenger_id; // Имя контакта можно извлечь из данных

                const params = {
                    account_id,
                    contact_name,
                    contact_photo_url: '', // URL фото контакта
                };

                const newContact = await this.contactsService.createContact(params);
                if (newContact) {
                    contact_id = newContact.contact_id;
                    const chatParams = {
                        contact_id,
                        messenger_id,
                        messenger_type: 'wa',
                    };

                    const newChat = await this.chatsService.createChat(chatParams);
                    chat_id = newChat.chat_id;
                }
            } else {
                contact_id = isChat.contact_id;
                chat_id = isChat.chat_id;
            }

            // Сохранение сообщения
            const messageParams = {
                message_value,
                message_type: 'text',
                messenger_type: 'wa',
                manager_id: '',
                contact_id,
                chat_id,
            };

            await this.sendMessageFromWa(messageParams);
        });
    }

    // Отправка сообщения через WhatsApp
    async sendMessage(to: string, body: string) {
        this.socket.emit('send-message', { to, body });
    }

    // Логика отправки сообщения и сохранения в базе данных
    async sendMessageFromWa(params: any) {
        const message = await this.messagesService.createMessage(params);
        this.eventGateway.ioServer.emit('update', message);
        return message;
    } */

/* // Проверка номера WhatsApp
    async checkWaNumber(contact_phone: string, contact_id: string) {
        const convertedNumber = this.formatPhoneNumber(contact_phone);
        const chatId = `${convertedNumber}@c.us`;

        // Отправка запроса на проверку номера через сокет
        this.socket.emit('check-number', { contact_phone: chatId }, (response: any) => {
            if (response.status) {
                console.log(`Номер ${contact_phone} зарегистрирован в WhatsApp`);
                this.contactsService.updateContact({
                    contact_id,
                    contact_wa_status: true,
                });
                return { contact_wa_status: true };
            } else {
                console.log(`Номер ${contact_phone} не зарегистрирован в WhatsApp`);
                this.contactsService.updateContact({
                    contact_id,
                    contact_wa_status: false,
                });
                return { contact_wa_status: false };
            }
        });
    }


    checkWaNumber2 = async (contact_phone, contact_id) => {
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






    

    // Форматирование номера телефона
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

    // Логика для обработки сообщений из Getcourse
    
}

/* init() {
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

           
        });
        this.whatsappBot.initialize();
    }
    sendMessageFromWa2 = async (params, attachments?) => {
        const message = await this.messagesService.createMessage(params);
        this.eventGateway.ioServer.emit('update', message);
        return message;
    };

    
    checkWaNumber2 = async (contact_phone, contact_id) => {
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

    newMessageFromGetcourse2 = async (dto: WaFromGetcourse) => {
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

    formatPhoneNumber2(phoneNumber: string): string {
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
} */
