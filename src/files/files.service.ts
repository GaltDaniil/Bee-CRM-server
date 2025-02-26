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
        fileBuffer, // Уточняем тип до Buffer
        fileName: string,
        fileType: string,
    ): Promise<{ filePath: string; attachment_src: string }> {
        const fileFolder = `assets/${fileType}`; // Относительный путь к папке
        const fileDir = path.join(__dirname, '../..', fileFolder); // Полный путь на сервере

        // Проверяем и создаем директорию асинхронно
        if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true });
        }

        // Формируем безопасное имя файла
        const attachment_src = `${fileFolder}/${fileName}`; // Относительный путь для DTO
        const filePath = path.join(fileDir, fileName); // Полный путь для сохранения

        // Сохраняем файл асинхронно
        await fs.writeFileSync(filePath, fileBuffer);

        return { filePath, attachment_src }; // Возвращаем полный путь и относительный путь
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
