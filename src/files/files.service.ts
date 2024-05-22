import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import * as path from 'path';
import * as fs from 'fs';
import { CardsService } from 'src/cards/cards.service';
import { error } from 'console';

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

    async saveChatImage(file, fileExtension) {
        try {
            console.log(file);
            // Генерируем уникальное имя файла с использованием nanoid
            const fileName = nanoid() + '.' + fileExtension;
            // Путь к папке для сохранения изображений
            const uploadDir = path.resolve(__dirname, '../..', 'assets/images/chats');

            // Создаем папку, если она не существует
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            console.log(`файл с именем ${fileName} по пути ${uploadDir} создается`);
            // Полный путь к файлу на сервере
            const filePath = path.join(uploadDir, fileName);

            // Записываем файл на сервер
            fs.writeFileSync(filePath, file);

            // Возвращаем относительный путь к файлу
            if (fileName && filePath) {
                return { fileName, filePath };
            }
        } catch (error) {
            // Ловим исключение, если произошла ошибка при сохранении файла
            console.log(error);
            throw new HttpException(
                'Произошла ошибка при сохранении файла',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
