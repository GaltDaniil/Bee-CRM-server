import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { io, Socket } from 'socket.io-client';

import { customAlphabet } from 'nanoid';
import { Message } from './messages.model';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatsService } from 'src/chats/chats.service';
import { TelegramService } from 'src/messengers/telegram/telegram.service';
import { EventGateway } from 'src/event/event.gateway';
import { Attachment } from 'src/attachments/attachments.model';
import { tgBot, vkBot, waBot } from 'src/messengers/bots.init';
import { AttachmentsService } from 'src/attachments/attachments.service';

import { Upload } from 'vk-io';
import { FilesService } from 'src/files/files.service';
import { WaService } from 'src/messengers/wa/wa.service';
import { MessengerAttachments } from 'src/attachments/dto/attachment.dto';

const nanoid = customAlphabet('abcdef123456789', 24);

@Injectable()
export class MessagesService {
    private socket: Socket;
    constructor(
        @InjectModel(Message) private messageRepository: typeof Message,
        private chatsService: ChatsService,
        private attachmentsService: AttachmentsService,
        @Inject(forwardRef(() => WaService)) private whatsappService: WaService,
    ) {}

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
                include: [{ model: Attachment }],
            });
            return messages; /* messages.map((message) => ({
                message_id: message.message_id,
                chat_id: message.chat_id,
                contact_id: message.contact_id,
                manager_id: message.manager_id,
                message_value: message.message_value,
                createdAt: message.createdAt,
            })); */
        } catch (error) {
            console.log(error);
        }
    }

    async createMessage(dto: CreateMessageDto) {
        try {
            console.log('Начало создания сообщения', dto);
            //@ts-ignore
            dto.message_id = nanoid();

            const message = await this.messageRepository.create(dto);

            if (dto.attachments) {
                await this.attachmentsService.sortAndSaveAttachments(
                    message.message_id as string,
                    dto,
                );
            }

            // УВЕДОМЛЕНИЕ ДЛЯ МЕНЕДЖЕРОВ

            // Исключения
            const excludedMessages = [
                'Акция 1+1=3',
                'Да, я фитнес-тренер',
                'Начать обучение',
                'Очень хочу им стать',
                'Нет, хочу им стать',
                'Хочу стать',
                'Позвать менеджера',
                'Назад',
                'Информация о курсах',
                'На главную',
                'Здравствуйте! Пришлёте видео?',
                'Здравствуйте! Меня заинтересовал данный товар.',
                'Здравствуйте! Как оформить заказ?',
                'Здравствуйте! Когда можно посмотреть?',
            ];

            if (!dto.manager_id) {
                this.chatsService.addUnreadCount(dto.chat_id);
                //Исключения из уведомлений
                if (
                    dto.messenger_id === '181693928' ||
                    dto.chat_id === '91e685ba76ec84e48c2b7a43' ||
                    dto.chat_id === '9e6c6c99a89776272b573c36' ||
                    dto.chat_id === '86e58d9d43f9d1d2eda17f7c'
                ) {
                } else if (excludedMessages.includes(dto.message_value)) {
                } else if (dto.message_value === '') {
                    // Лиля
                    tgBot.sendMessage(
                        360641449,
                        `Пришло новое сообщение c файлом в чат https://beechat.ru/apps/chat/${message.chat_id}"`,
                        {
                            /* parse_mode: 'MarkdownV2', */
                            disable_web_page_preview: true,
                        },
                    );
                    // Яна
                    tgBot.sendMessage(
                        1037441383,
                        `Пришло новое сообщение c файлом в чат https://beechat.ru/apps/chat/${message.chat_id}"`,
                        {
                            /* parse_mode: 'MarkdownV2', */
                            disable_web_page_preview: true,
                        },
                    );
                    // Даня
                    tgBot.sendMessage(
                        299602933,
                        `Пришло новое сообщение c файлом в чат https://beechat.ru/apps/chat/${message.chat_id}"`,
                        {
                            /* parse_mode: 'MarkdownV2', */
                            disable_web_page_preview: true,
                        },
                    );
                } else {
                    // Лиля
                    tgBot.sendMessage(
                        360641449,
                        `Пришло новое сообщение в чат https://beechat.ru/apps/chat/${message.chat_id} c текстом "${message.message_value}"`,
                        {
                            /* parse_mode: 'MarkdownV2', */
                            disable_web_page_preview: true,
                        },
                    );
                    // Яна
                    tgBot.sendMessage(
                        1037441383,
                        `Пришло новое сообщение в чат https://beechat.ru/apps/chat/${message.chat_id} c текстом "${message.message_value}"`,
                        {
                            /* parse_mode: 'MarkdownV2', */
                            disable_web_page_preview: true,
                        },
                    );
                    // Даня
                    tgBot.sendMessage(
                        299602933,
                        `Пришло новое сообщение в чат https://beechat.ru/apps/chat/${message.chat_id} c текстом "${message.message_value}"`,
                        {
                            /* parse_mode: 'MarkdownV2', */
                            disable_web_page_preview: true,
                        },
                    );
                }
            } else {
                this.chatsService.readAllMessages(dto.chat_id);
                if (dto.message_from === 'main') {
                    return message;
                } else {
                    this.sendMessageToMessenger(
                        dto.messenger_id,
                        dto.messenger_type,
                        dto.message_value,
                        dto.attachments,
                    );
                }
            }

            return message;
        } catch (error) {
            console.log(error);
            console.log();
        }
    }

    async readMessage(chat_id: string) {
        try {
            //@ts-ignore
            const message = await this.messageRepository.update(chat_id);
            return message;
        } catch (error) {
            console.log(error);
        }
    }

    async sendMessageToMessenger(
        messenger_id: string,
        messenger_type: string,
        message_value: string,
        attachments?,
    ) {
        try {
            if (messenger_type === 'telegram') {
                if (message_value.trim())
                    await tgBot.sendMessage(Number(messenger_id), message_value, {
                        is_bot_message: true,
                    });
                if (attachments) {
                    for (const attachment of attachments) {
                        try {
                            const fileOptions = {
                                filename: attachment.originalname,
                                contentType: attachment.mimetype,
                            };

                            if (attachment.mimetype.startsWith('image')) {
                                fileOptions.contentType = 'image/jpeg';
                                await tgBot.sendPhoto(
                                    Number(messenger_id),
                                    attachment.buffer,
                                    {},
                                    fileOptions,
                                );
                            } else if (attachment.mimetype.startsWith('video')) {
                                await tgBot.sendVideo(
                                    Number(messenger_id),
                                    attachment.buffer,
                                    {},
                                    fileOptions,
                                );
                            } else if (attachment.mimetype.startsWith('audio')) {
                                await tgBot.sendAudio(
                                    Number(messenger_id),
                                    attachment.buffer,
                                    {},
                                    fileOptions,
                                );
                            } else {
                                await tgBot.sendDocument(
                                    Number(messenger_id),
                                    attachment.buffer,
                                    {},
                                    fileOptions,
                                );
                            }
                        } catch (error) {
                            console.error('Error sending attachment to Telegram:', error);
                        }
                    }
                }
            }
            if (messenger_type === 'vk') {
                let uploadedAttachment;
                let uploadedAttachments = [];
                if (attachments.length > 0) {
                    for (const attachment of attachments) {
                        if (attachment.mimetype === 'image/jpeg') {
                            uploadedAttachment = await vkBot.upload.messagePhoto({
                                peer_id: Number(messenger_id),
                                source: {
                                    value: attachment.buffer,
                                    filename: attachment.originalname,
                                },
                            });
                            uploadedAttachment.toString;
                        }
                        uploadedAttachments.push(uploadedAttachment);
                    }
                    uploadedAttachments.join(',');
                }
                const randomId = Math.floor(Math.random() * 1000000);
                vkBot.api.messages.send({
                    user_id: Number(messenger_id),
                    message: message_value,
                    random_id: randomId,
                    attachment: uploadedAttachments,
                });
            }
            if (messenger_type === 'instagram') {
            }
            if (messenger_type === 'wa') {
                let attachmentsData = [];
                if (attachments && attachments.length > 0) {
                    for (const attachment of attachments) {
                        const params = {
                            messenger_id,
                            buffer: attachment.buffer,
                            filename: attachment.originalname,
                            mimeType: attachment.mimetype,
                            size: attachment.size,
                        };
                        attachmentsData.push(params);
                        console.log();
                    }
                }
                this.whatsappService.sendMessage(messenger_id, message_value, attachmentsData);
            }
        } catch (error) {
            console.log(error);
        }
    }

    /* async sendVkMessage(message: CreateMessageDto) {
        const { message_value, attachments, messenger_id } = message;

        try {
            // 1. Если есть вложения, загружаем их
            let attachmentString = '';
            const upload = new Upload(vkBot);

            console.log('upload', upload);

            if (attachments && attachments.length > 0) {
                const uploadPromises = attachments.map(async (attachment) => {
                    // Загружаем только изображения
                    if (attachment.attachment_type === 'image') {
                        // Загружаем фото
                        const uploaded = await upload.messagePhoto({
                            source: {
                                value: attachment.attachment_src, // Если файл на сервере
                            },
                        });
                        return `photo${uploaded[0].owner_id}_${uploaded[0].id}`;
                    }
                    // Обработайте другие типы вложений (если нужно)
                });

                // Ждем завершения загрузки всех файлов
                const uploadedAttachments = await Promise.all(uploadPromises);
                attachmentString = uploadedAttachments.join(',');
            }

            // 2. Отправляем сообщение
            await vkBot.api.messages.send({
                user_id: Number(messenger_id), // ID пользователя ВКонтакте
                message: message_value, // Текст сообщения
                random_id: Date.now(), // Уникальный идентификатор для сообщения
                attachment: attachmentString, // Вложения (если есть)
            });

            console.log('Сообщение отправлено!');
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        }
    } */

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
