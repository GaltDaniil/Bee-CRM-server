import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/attachment.dto';
import { Attachment } from './attachments.model';
import { InjectModel } from '@nestjs/sequelize';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
import { AttachmentsProvider } from './attachments.provider';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';

@Injectable()
export class AttachmentsService {
    constructor(
        @InjectModel(Attachment) private attachmentRepository: typeof Attachment,

        private attachmentsProvider: AttachmentsProvider,
    ) {}

    async sortAttachments(message_id: string, dto: CreateMessageDto) {
        const { attachments, messenger_type, message_from, messenger_id } = dto;
        let attachmentsDataArray;

        switch (messenger_type) {
            case 'telegram':
                attachmentsDataArray =
                    await this.attachmentsProvider.telegramAttachmentsParser(attachments);
                break;
            case 'wa':
                break;
            case 'vk':
                attachmentsDataArray = await this.attachmentsProvider.vkAttachmentsParser(
                    attachments,
                    message_from,
                    messenger_id,
                );

                break;
            case 'crm':
                return;
            default:
                console.error(`Неизвестный тип мессенджера: ${messenger_type}`);
                return [];
        }
        console.log('attachmentsDataArray в sortAttachments', attachmentsDataArray);
        // Если массив пустой, возвращаем пустой результат
        if (!attachmentsDataArray || attachmentsDataArray.length === 0) {
            console.warn('Массив вложений пуст.');
            return [];
        }

        // Проходимся по каждому элементу массива и вызываем this.CreateAttachments
        const createdAttachments = [];
        for (const attachmentData of attachmentsDataArray) {
            try {
                // Вызываем вашу функцию CreateAttachments для каждого элемента
                const createdAttachment = await this.createAttachment({
                    message_id,
                    ...attachmentData, // Передаем данные вложения
                });
                console.log('Созданный attachments', createdAttachment);
                if (createdAttachment) {
                    createdAttachments.push(createdAttachment);
                }
            } catch (error) {
                console.error(`Ошибка при создании вложения: ${error.message}`);
            }
        }

        // Возвращаем массив созданных вложений
        return createdAttachments;
    }

    async createAttachment(dto: CreateAttachmentDto, filePath?) {
        try {
            dto.attachment_id = nanoid();

            const attachment = await this.attachmentRepository.create(dto);
            return attachment;
        } catch (error) {
            console.log(error);
            if (filePath) {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            throw new HttpException(
                'Произошла ошибка при сохранении файла-картинки в БД attachments',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async deleteAttachment(attachment_id) {
        return await this.attachmentRepository.destroy({ where: { attachment_id } });
    }
}
