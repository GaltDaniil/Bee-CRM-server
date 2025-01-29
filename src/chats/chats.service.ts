import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Chat } from './chats.model';
import { UpdateChatDto } from './dto/update-chat.dto';

import { customAlphabet } from 'nanoid';
import { Contact } from 'src/contacts/contacts.model';
import { Sequelize } from 'sequelize';
import { Message } from 'src/messages/messages.model';
import { UsersService } from 'src/users/users.service';
import { tgBot } from 'src/messengers/bots.init';

import { Op } from 'sequelize';
import { Card } from 'src/cards/cards.model';

const nanoid = customAlphabet('abcdef123456789', 24);

@Injectable()
export class ChatsService {
    constructor(
        private userService: UsersService,
        @InjectModel(Chat) private chatRepository: typeof Chat,
        @InjectModel(Contact)
        private contactsRepository: typeof Contact,
        @InjectModel(Message)
        private messageRepository: typeof Message,
        /* @InjectModel(Card)
        private cardRepository: typeof Card, */
    ) {}

    async getAllChats() {
        try {
            const chats = await this.chatRepository.findAll();
            return { chats };
        } catch (error) {
            console.log(error);
        }
    }

    async getPartChats(limit, filter?) {
        try {
            const chats = await this.chatRepository.findAll({
                limit,
                logging: false,
                include: [
                    {
                        model: this.messageRepository,
                        attributes: [
                            'message_id',
                            'message_value',
                            'createdAt',
                            // Другие поля сообщения, которые вы хотите включить
                        ],
                        limit: 1, // Получаем только одно последнее сообщение
                        order: [['createdAt', 'DESC']], // Сортируем по убыванию даты
                    },
                    {
                        model: this.contactsRepository, // Предположим, что у вас есть модель Contact
                        attributes: [
                            'contact_name',
                            'contact_status',
                            'contact_photo_url',
                            'contact_getcourse',
                            'contact_bothelp_kn',
                            'contact_bothelp_bs',
                        ],
                    },
                ],
                order: [['updatedAt', 'DESC']],
            });
            const result = chats.map((chat) => {
                return {
                    chat_id: chat.chat_id,
                    contact_id: chat.contact_id,
                    unread_count: chat.unread_count,
                    messenger_id: chat.messenger_id,
                    messenger_username: chat.messenger_username,
                    messenger_type: chat.messenger_type,
                    instagram_chat_id: chat.instagram_chat_id,
                    from_url: chat.from_url,
                    chat_muted: chat.chat_muted,
                    lastMessage: chat.messages.length > 0 ? chat.messages[0].message_value : null,
                    lastMessageAt: chat.messages.length > 0 ? chat.messages[0].createdAt : null,
                    chat_contact: {
                        contact_name: chat.contact ? chat.contact.contact_name : null,
                        contact_status: chat.contact ? chat.contact.contact_status : null,
                        contact_photo_url: chat.contact ? chat.contact.contact_photo_url : null,
                        contact_getcourse: chat.contact ? chat.contact.contact_getcourse : null,
                        contact_bothelp_kn: chat.contact ? chat.contact.contact_bothelp_kn : null,
                        contact_bothelp_bs: chat.contact ? chat.contact.contact_bothelp_bs : null,
                    },
                };
            });
            return result;
        } catch (error) {
            console.log('ошибка при загрузки части чатов', error);
        }
    }

    async getPartChatsTest(limit, filter?) {
        try {
            let chats;
            if (filter === 'all') {
                chats = await this.chatRepository.findAll({
                    limit,
                    logging: false,
                    include: [
                        {
                            model: this.messageRepository,
                            attributes: [
                                'message_id',
                                'message_value',
                                'createdAt',
                                // Другие поля сообщения, которые вы хотите включить
                            ],
                            limit: 1, // Получаем только одно последнее сообщение
                            order: [['createdAt', 'DESC']], // Сортируем по убыванию даты
                        },
                        {
                            model: this.contactsRepository, // Предположим, что у вас есть модель Contact
                            attributes: [
                                'contact_name',
                                'contact_status',
                                'contact_photo_url',
                                'contact_getcourse',
                                'contact_bothelp_kn',
                                'contact_bothelp_bs',
                            ],
                            include: [{ model: Card }],
                        },
                    ],
                    order: [['updatedAt', 'DESC']],
                });
            } else if (filter === 'new') {
                chats = await this.chatRepository.findAll({
                    limit,
                    logging: false,
                    include: [
                        {
                            model: this.messageRepository,
                            attributes: [
                                'message_id',
                                'message_value',
                                'createdAt',
                                // Другие поля сообщения, которые вы хотите включить
                            ],
                            limit: 1, // Получаем только одно последнее сообщение
                            order: [['createdAt', 'DESC']], // Сортируем по убыванию даты
                        },
                        {
                            model: this.contactsRepository, // Предположим, что у вас есть модель Contact
                            attributes: [
                                'contact_name',
                                'contact_status',
                                'contact_photo_url',
                                'contact_getcourse',
                                'contact_bothelp_kn',
                                'contact_bothelp_bs',
                            ],
                        },
                    ],
                    order: [['updatedAt', 'DESC']],
                    where: {
                        unread_count: {
                            [Op.gt]: 0,
                        },
                    },
                });
            } else if (filter === 'order') {
                chats = await this.chatRepository.findAll({
                    limit,
                    logging: false,
                    include: [
                        {
                            model: this.messageRepository,
                            attributes: [
                                'message_id',
                                'message_value',
                                'createdAt',
                                // Другие поля сообщения, которые вы хотите включить
                            ],
                            limit: 1, // Получаем только одно последнее сообщение
                            order: [['createdAt', 'DESC']], // Сортируем по убыванию даты
                        },
                        {
                            model: this.contactsRepository, // Предположим, что у вас есть модель Contact
                            attributes: [
                                'contact_name',
                                'contact_status',
                                'contact_photo_url',
                                'contact_getcourse',
                                'contact_bothelp_kn',
                                'contact_bothelp_bs',
                            ],
                            where: { contact_getcourse: true },
                            required: true,
                        },
                    ],
                    order: [['updatedAt', 'DESC']],
                });
            }
            const result = chats.map((chat) => {
                return {
                    chat_id: chat.chat_id,
                    contact_id: chat.contact_id,
                    unread_count: chat.unread_count,
                    messenger_id: chat.messenger_id,
                    messenger_username: chat.messenger_username,
                    messenger_type: chat.messenger_type,
                    instagram_chat_id: chat.instagram_chat_id,
                    from_url: chat.from_url,
                    chat_muted: chat.chat_muted,
                    lastMessage: chat.messages.length > 0 ? chat.messages[0].message_value : null,
                    lastMessageAt: chat.messages.length > 0 ? chat.messages[0].createdAt : null,
                    chat_contact: {
                        contact_name: chat.contact ? chat.contact.contact_name : null,
                        contact_status: chat.contact ? chat.contact.contact_status : null,
                        contact_photo_url: chat.contact ? chat.contact.contact_photo_url : null,
                        contact_getcourse: chat.contact ? chat.contact.contact_getcourse : null,
                        contact_bothelp_kn: chat.contact ? chat.contact.contact_bothelp_kn : null,
                        contact_bothelp_bs: chat.contact ? chat.contact.contact_bothelp_bs : null,
                        contact_cards: chat.contact ? chat.contact.cards : null,
                    },
                };
            });
            return result;
        } catch (error) {
            console.log('ошибка при загрузки части чатов', error);
        }
    }

    async getUserById(id: string) {
        try {
            const { user_id, user_name, user_email, user_status, user_photo_url, user_about } =
                await this.userService.getUserById(id);
            return { user_id, user_name, user_email, user_status, user_photo_url, user_about };
        } catch (error) {}
    }
    async getChatByContactId(id: string) {
        try {
            const chat = await this.chatRepository.findOne({ where: { contact_id: id } });
            return chat;
        } catch (error) {}
    }

    async getAllChatsDemo() {
        try {
            const chats = await this.chatRepository.findAll({
                logging: false,
                include: [
                    {
                        model: this.messageRepository,
                        attributes: [
                            'message_id',
                            'message_value',
                            'createdAt',
                            // Другие поля сообщения, которые вы хотите включить
                        ],
                        limit: 1, // Получаем только одно последнее сообщение
                        order: [['createdAt', 'DESC']], // Сортируем по убыванию даты
                    },
                    {
                        model: this.contactsRepository, // Предположим, что у вас есть модель Contact
                        attributes: [
                            'contact_name',
                            'contact_status',
                            'contact_photo_url',
                            'contact_getcourse',
                            'contact_bothelp_kn',
                            'contact_bothelp_bs',
                        ],
                    },
                ],
            });
            return chats.map((chat) => {
                return {
                    chat_id: chat.chat_id,
                    contact_id: chat.contact_id,
                    unread_count: chat.unread_count,
                    messenger_id: chat.messenger_id,
                    messenger_username: chat.messenger_username,
                    messenger_type: chat.messenger_type,
                    instagram_chat_id: chat.instagram_chat_id,
                    from_url: chat.from_url,
                    chat_muted: chat.chat_muted,
                    lastMessage: chat.messages.length > 0 ? chat.messages[0].message_value : null,
                    lastMessageAt: chat.messages.length > 0 ? chat.messages[0].createdAt : null,
                    chat_contact: {
                        contact_name: chat.contact ? chat.contact.contact_name : null,
                        contact_status: chat.contact ? chat.contact.contact_status : null,
                        contact_photo_url: chat.contact ? chat.contact.contact_photo_url : null,
                        contact_getcourse: chat.contact ? chat.contact.contact_getcourse : null,
                        contact_bothelp_kn: chat.contact ? chat.contact.contact_bothelp_kn : null,
                        contact_bothelp_bs: chat.contact ? chat.contact.contact_bothelp_bs : null,
                    },
                };
            });
        } catch (error) {
            console.log(error);
        }
    }

    async getChatById(id: string) {
        try {
            const chat = await this.chatRepository.findOne({ where: { chat_id: id } });
            return chat;
        } catch (error) {
            console.log(error);
        }
    }

    async getContactById(id: string) {
        try {
            const contact = await this.contactsRepository.findOne({ where: { contact_id: id } });
            return contact;
        } catch (error) {
            console.log(error);
        }
    }
    async getChatByMessengerId(id: string) {
        try {
            const chat = await this.chatRepository.findOne({ where: { messenger_id: id } });
            return chat;
        } catch (error) {
            console.log(error);
        }
    }

    async createChat(dto: CreateChatDto) {
        try {
            //@ts-ignore
            dto.chat_id = nanoid();
            const chat = await this.chatRepository.create(dto);

            return chat;
        } catch (error) {
            console.log(error);
        }
    }
    async createChatByContact(dto: CreateChatDto) {
        try {
            //@ts-ignore
            dto.chat_id = nanoid();
            const chat = await this.chatRepository.create(dto);

            return chat;
        } catch (error) {
            console.log(error);
        }
    }

    async updateChat(dto: UpdateChatDto) {
        try {
            const [updatedRowsCount, updatedChats] = await this.chatRepository.update(dto, {
                where: { chat_id: dto.chat_id },
                returning: true,
            });
            if (updatedRowsCount === 0) {
                throw new NotFoundException(`Chat with id ${dto.chat_id} not found.`);
            }
            return updatedChats[0];
        } catch (error) {
            console.log(error);
        }
    }

    async deleteChat(id: string) {
        try {
            const deletedRowsCount = await this.chatRepository.destroy({ where: { chat_id: id } });

            if (deletedRowsCount === 0) {
                throw new NotFoundException(`Chat with id ${id} not found.`);
            }
            return { success: true, message: `Chat with id ${id} deleted successfully.` };
        } catch (error) {
            console.log(error);
        }
    }

    async unreadCount() {
        try {
            // Поиск всех чатов, где unread_count больше 0
            const chats = await this.chatRepository.findAll({
                where: {
                    unread_count: {
                        [Op.gt]: 0, // Используем оператор "больше" для поиска значений больше 0
                    },
                },
            });

            // Возвращаем найденные чаты
            return chats.length;
        } catch (error) {
            // Обработка ошибок
            console.error('Ошибка при поиске чатов с непрочитанными сообщениями:', error);
            throw error; // Пробрасываем ошибку выше
        }
    }

    async readAllMessages(chat_id: string) {
        try {
            const chat = await this.chatRepository.update(
                { unread_count: 0 },
                {
                    returning: true,
                    where: { chat_id: chat_id },
                },
            );
            return chat;
        } catch (error) {
            console.log(error);
        }
    }

    async addUnreadCount(chat_id: string) {
        this.chatRepository.update(
            { unread_count: Sequelize.literal('"unread_count" + 1') },
            {
                where: { chat_id },
            },
        );
    }
}
