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
            console.log(`файл с именем ${fileName} по пути ${filePath} создается`);
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
}
