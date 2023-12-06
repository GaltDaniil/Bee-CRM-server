import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Chat } from './chats.model';
import { UpdateChatDto } from './dto/update-chat.dto';

import { customAlphabet } from 'nanoid';
import { Contact } from 'src/contacts/contacts.model';
import sequelize from 'sequelize';
import { Message } from 'src/messages/messages.model';
import { User } from 'src/users/users.model';

const nanoid = customAlphabet('abcdef123456789', 24);

@Injectable()
export class ChatsService {
    constructor(
        @InjectModel(Chat) private chatRepository: typeof Chat,
        @InjectModel(User) private userRepository: typeof User,
        @InjectModel(Contact)
        private contactsRepository: typeof Contact,
        @InjectModel(Message)
        private messageRepository: typeof Message,
    ) {}

    async getAllChats() {
        try {
            const chats = await this.chatRepository.findAll();
            return { chats };
        } catch (error) {
            console.log(error);
        }
    }

    async getUserById(id: string) {
        try {
            const { user_id, user_name, user_email, user_status, user_photo_url, user_about } =
                await this.userRepository.findOne({ where: { user_id: id } });
            return { user_id, user_name, user_email, user_status, user_photo_url, user_about };
        } catch (error) {}
    }

    async getAllChatsDemo() {
        try {
            const chats = await this.chatRepository.findAll({
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
                ],
            });
            return chats.map((chat) => {
                return {
                    chat_id: chat.chat_id,
                    contact_id: chat.contact_id,
                    unread_count: chat.unread_count,
                    chat_muted: chat.chat_muted,
                    lastMessage: chat.messages.length > 0 ? chat.messages[0].message_value : null,
                    lastMessageAt: chat.messages.length > 0 ? chat.messages[0].createdAt : null,
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

    async updateChat(id: string, dto: UpdateChatDto) {
        try {
            const [updatedRowsCount, updatedChats] = await this.chatRepository.update(dto, {
                where: { chat_id: id },
                returning: true,
            });
            if (updatedRowsCount === 0) {
                throw new NotFoundException(`Chat with id ${id} not found.`);
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

    async getContactsWithChats() {
        const contactWithChats = await this.contactsRepository.findAll({
            include: [
                {
                    model: this.chatRepository,
                },
            ],
            where: {},
        });

        return contactWithChats.map((contact) => ({
            contact_id: contact.contact_id,
            contact_photo_url: contact.contact_photo_url || '',
            contact_name: contact.contact_name || '',
            contact_about: contact.contact_about || '',
            contact_status: contact.contact_status || 'offline',
            details: {
                emails: contact.contact_email ? [contact.contact_email] : [],
                phones: contact.contact_phone ? [contact.contact_phone] : [],
                title: '', // Добавьте логику для этого поля
                company: '', // Добавьте логику для этого поля
                birthday: contact.contact_birthday || '',
                address: contact.contact_address || '',
            },
            attachments: {
                media: [],
                docs: [],
                links: [],
            },
        }));
    }
}
