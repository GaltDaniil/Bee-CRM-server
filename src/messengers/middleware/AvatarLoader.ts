import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import fs from 'fs';

export const avatarUrlSaver = async (userId: number, url?: string) => {
    try {
        if (url) {
            const response = await axios.get(url!, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');
            const filename = `avatar_${userId}.jpg`;
            const filePath = `./imgs/userAvatars/${filename}`;
            console.log('filePath', filePath);
            console.log('imageBuffer', imageBuffer);
            fs.writeFileSync(filePath, imageBuffer);

            console.log(`Аватар пользователя ${userId} сохранен на сервере в ${filePath}`);
            return filePath.slice(2);
        }
    } catch (error) {
        console.error('Ошибка при сохранении аватара в БД', error);
    }
};
