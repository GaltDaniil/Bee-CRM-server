import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { customAlphabet } from 'nanoid';
import { Message } from './messages.model';
import { CreateMessageDto } from './dto/create-message.dto';

const nanoid = customAlphabet('abcdef123456789', 24);

@Injectable()
export class MessagesService {
    constructor(@InjectModel(Message) private messageRepository: typeof Message) {}

    async getAllMessages() {
        try {
            const messages = await this.messageRepository.findAll();
            return messages;
        } catch (error) {
            console.log(error);
        }
    }

    async getMessageById(id: string) {
        try {
            const message = await this.messageRepository.findOne({ where: { chat_id: id } });
            return message;
        } catch (error) {
            console.log(error);
        }
    }
    async getOneByIdDemo(id: string) {
        try {
            const message = await this.messageRepository.findOne({ where: { chat_id: id } });
            return message;
        } catch (error) {
            console.log(error);
        }
    }

    async getMessagesByIdDemo(id: string) {
        try {
            const messages = await this.messageRepository.findAll({
                where: { chat_id: id },
            });
            return messages.map((message) => ({
                message_id: message.message_id,
                chat_id: message.chat_id,
                contact_id: message.contact_id,
                manager_id: message.manager_id,
                message_value: message.message_value,
                createdAt: message.createdAt,
            }));
        } catch (error) {
            console.log(error);
        }
    }

    async createMessage(dto: CreateMessageDto) {
        try {
            //@ts-ignore
            dto.message_id = nanoid();

            const message = await this.messageRepository.create(dto);
            return message;
        } catch (error) {
            console.log(error);
        }
    }

    /* async updateMessage(id: string, dto: UpdateChatDto) {
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
    } */

    /* async deleteMessage(id: string) {
        try {
            const deletedRowsCount = await this.chatRepository.destroy({ where: { chat_id: id } });

            if (deletedRowsCount === 0) {
                throw new NotFoundException(`Chat with id ${id} not found.`);
            }
            return { success: true, message: `Chat with id ${id} deleted successfully.` };
        } catch (error) {
            console.log(error);
        }
    } */
}
