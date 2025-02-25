import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import * as path from 'path';
import * as fs from 'fs';
import { CardsService } from 'src/cards/cards.service';
import { error } from 'console';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';

import { TelegramProvider } from './providers/telegram.provider';
import { WhatsappProvider } from './providers/whatsapp.provider';

@Injectable()
export class FilesService {
    constructor(private cardsService: CardsService) {}

    async saveAvatarFromMessenger(file, messenger_id: string): Promise<string> {
        try {
            const partName = nanoid(24);
            const fileName = messenger_id + '.jpg';
            const filePath = path.resolve(__dirname, '../..', `assets/avatars`);
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, { recursive: true });
            }
            fs.writeFileSync(path.join(filePath, fileName), file);
            return 'assets/avatars/' + fileName;
        } catch (error) {
            console.log(error);
            throw new HttpException(
                'Произошла ошибка при записи файла',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async saveCardAttachment(file) {
        try {
            const fileOriginalName = file.originalname;
            const fileName = nanoid() + path.extname(file.originalname);
            const filePath = path.resolve(__dirname, '../..', `assets/card/attachments`);

            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, { recursive: true });
            }

            fs.writeFileSync(path.join(filePath, fileName), file.buffer);
            if (fileOriginalName && fileName && filePath) {
                return { fileOriginalName, fileName, filePath };
            }
            throw error;
        } catch (error) {
            console.log(error);

            throw new HttpException(
                'Произошла ошибка при сохранении файла-картинки в карточке',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async saveFile(
        fileBuffer: Buffer,
        fileName: string,
        fileType: string,
    ): Promise<{ filePath: string; fileUrl: string }> {
        const fileFolder = 'assets/' + fileType;
        let fileDir = path.join(__dirname, '../..', fileFolder);

        if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true });
        }

        const safeFileName = `${Date.now()}_${fileName.replace(/\s+/g, '_')}`;
        const fileUrl = 'https://beechat.ru/' + fileFolder + '/' + safeFileName;
        console.log('fileUrl', fileUrl);

        const filePath = path.join(fileDir, safeFileName);

        fs.writeFileSync(filePath, fileBuffer);

        return { filePath, fileUrl }; // Возвращаем путь к файлу
    }

    async tempFiles(file) {
        try {
            console.log('Файл для временного хранения', file);
            const folderPath = 'temp';
            const uploadDir = path.resolve(__dirname, '../..', 'assets', folderPath);

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const fullName = file.originalname;
            const filePath = path.join(uploadDir, fullName);
            fs.writeFileSync(filePath, file.buffer);
            return filePath;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
