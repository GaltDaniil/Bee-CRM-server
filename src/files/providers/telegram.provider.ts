import { Injectable } from '@nestjs/common';
import { tgBot } from 'src/messengers/bots.init';
import axios from 'axios';
import * as fs from 'fs';

interface file {
    buffer: BinaryType;
    file_name: string;
    file_type: string;
}
type downloadedFiles = file[];

@Injectable()
export class TelegramProvider {
    async downloadFilesFromTelegram(attachments) {
        if (!attachments || !attachments.files || attachments.files.length === 0) {
            return []; // Если файлов нет, возвращаем пустой массив
        }

        const downloadedFiles: downloadedFiles = [];

        for (const file of attachments.files) {
            try {
                const fileUrl = await tgBot.getFileLink(file.file_id); // Получаем ссылку на файл
                const response = await axios.get(fileUrl, { responseType: 'arraybuffer' }); // Скачиваем файл

                downloadedFiles.push({
                    buffer: response.data, // Сам файл в бинарном формате
                    file_name: file.file_name, // Имя файла
                    file_type: attachments.files_type, // Тип файла (image, document, video и т. д.)
                });
            } catch (error) {
                console.error(`Ошибка при скачивании файла ${file.file_name}:`, error);
            }
        }
        console.log('downloadedFiles', downloadedFiles);
        return downloadedFiles;
    }
}
