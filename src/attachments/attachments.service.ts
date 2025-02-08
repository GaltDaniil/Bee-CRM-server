import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/attachment.dto';
import { Attachment } from './attachments.model';
import { InjectModel } from '@nestjs/sequelize';
import { nanoid } from 'nanoid';
import * as path from 'path';
import * as fs from 'fs';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';

@Injectable()
export class AttachmentsService {
    constructor(@InjectModel(Attachment) private attachmentRepository: typeof Attachment) {}

    async createAttachment(dto: CreateAttachmentDto, filePath) {
        try {
            dto.attachment_id = nanoid();

            const attachment = await this.attachmentRepository.create(dto);
            console.log('attachment успешно создался', attachment);
        } catch (error) {
            console.log(error);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
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
