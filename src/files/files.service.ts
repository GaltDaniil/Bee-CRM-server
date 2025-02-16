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
    constructor(
        private cardsService: CardsService,

        private readonly telegramProvider: TelegramProvider,
        //private readonly whatsappProvider: WhatsappProvider,
        //private readonly vkProvider: VkProvider,
    ) {}

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
            const urlPath = 'assets/' + folderPath + '/' + fullName;
            return filePath;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    // Основная функция для сохранения файла
    /* async saveChatFiles(files, message_id) {
        try {
            // Массив для хранения информации о сохраненных файлах
            const savedFiles = [];

            // Проходим по каждому файлу из массива
            for (const file of files) {
                console.log('file в массиве перебора и сохранения', file);
                // Определяем путь к папке на основе типа файла
                const folders = {
                    photo: 'images/chats',
                    image: 'images/chats',
                    document: 'documents',
                    video: 'videos',
                    audio: 'audio',
                    voice: 'audio/voice',
                };

                const mimeTypesToExtensions = {
                    'image/jpeg': '.jpg',
                    'image/png': '.png',
                    'image/gif': '.gif',
                    'application/pdf': '.pdf',
                    'text/plain': '.txt',
                    'video/mp4': '.mp4',
                    'audio/mpeg': '.mp3',
                };

                const folderPath = folders[file.file_type] || 'other';

                // Полный путь к папке для сохранения
                const uploadDir = path.resolve(__dirname, '../..', 'assets', folderPath);

                // Создаем папку, если ее нет
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                // Определяем расширение файла, если оно отсутствует
                let extension = path.extname(file.file_name);

                // Если расширение отсутствует, пытаемся взять его из MIME-типа
                if (!extension && mimeTypesToExtensions[file.mime_type]) {
                    extension = mimeTypesToExtensions[file.mime_type];
                }

                // Если расширения все еще нет, то присваиваем '.unknown'
                if (!extension) {
                    extension = '.unknown';
                }

                const fullName = file.file_name + extension;

                // Полный путь к файлу
                const filePath = path.join(uploadDir, fullName);
                const urlPath = 'assets/' + folderPath + '/' + fullName;

                // Записываем файл
                fs.writeFileSync(filePath, file.buffer);

                console.log(`Файл сохранен в ${uploadDir}, файл с именем ${file.file_name}`);

                const params = {
                    attachment_name: fullName,
                    attachment_url: urlPath,
                    attachment_type: file.file_type,
                    attachment_src: 'https://beechat.ru/' + urlPath,
                    attachment_market: {},
                    message_id,
                };

                await this.attachmentsService.createAttachment(params, filePath);

                // Добавляем информацию о файле в массив
                savedFiles.push({ file_name: fullName, file_path: filePath });
            }

            // Возвращаем массив с результатами для всех файлов
            return savedFiles;
        } catch (error) {
            console.error('Ошибка при сохранении файлов:', error);
            throw new HttpException(
                'Произошла ошибка при сохранении файлов',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    } */

    /* async sortAttachments(message_id, attachments, messenger_type) {
        let downloadedFiles;

        switch (messenger_type) {
            case 'telegram':
                downloadedFiles =
                    await this.telegramProvider.downloadFilesFromTelegram(attachments);
                await this.saveChatFiles(downloadedFiles, message_id);
                return;
            case 'wa':
                return;
            case 'vk':
                //downloadedFiles = await this.vkProvider.downloadFilesFromVk(attachments);

                return;
            case 'crm':
                return;
            default:
                console.error(`Неизвестный тип мессенджера: ${messenger_type}`);
                return [];
        }
    } */
}
