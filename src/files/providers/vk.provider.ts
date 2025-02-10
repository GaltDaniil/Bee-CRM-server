import { Injectable } from '@nestjs/common';
import { vkBot } from 'src/messengers/bots.init';
import axios from 'axios';
import * as fs from 'fs';
import {
    AudioAttachment,
    AudioMessageAttachment,
    DocumentAttachment,
    LinkAttachment,
    MarketAttachment,
    PhotoAttachment,
    StickerAttachment,
    VideoAttachment,
} from 'vk-io';

@Injectable()
export class VkProvider {
    /* async downloadFilesFromVk(attachments) {
        let attachmentData;
        for (const attachment of attachments) {
            if (attachment instanceof MarketAttachment) {
                const attachmentWithType = attachment as MarketAttachment;
                const attachment_market = {
                    price: attachmentWithType.price.text,
                    title: attachmentWithType.title,
                    description: attachmentWithType.description,
                    photo_url: attachmentWithType.thumbnailUrl,
                };
                const params = {
                    attachment_name: attachmentWithType.title,
                    attachment_src: attachmentWithType.thumbnailUrl,
                    attachment_type: 'market',
                    attachment_url: ' ',
                    attachment_market,
                    chat_id,
                    message_id,
                };

                attachmentData = this.attachmentsService.createAttachment(params, '');
            } else if (attachment instanceof PhotoAttachment) {
                console.log('Да, это фоточка');
                const attachmentWithType = attachment as PhotoAttachment;
                const attachment_url = attachment.sizes.find((size) => size.type === 'x')?.url; // Выбираем URL среднего размера изображения
                const params = {
                    attachment_name: attachmentWithType.id.toString(),
                    attachment_src: attachment_url,
                    attachment_type: 'image',
                    attachment_url,
                    attachment_market: {},
                    chat_id,
                    message_id,
                };
                attachmentData = this.attachmentsService.createAttachment(params, '');
                if (photoUrl) {
                        // Сохраняем фото на сервере или выполняем другие действия
                        const savedPhoto = await this.saveAttachment(photoUrl);
                        console.log('Сохраненное фото:', savedPhoto);
                    }
            } else if (attachment instanceof AudioMessageAttachment) {
                console.log('Да, это голосовое');
                // Если вложение - аудио
                // Обработка аудиофайла, сохранение на сервере и т.д.
            } else if (attachment instanceof VideoAttachment) {
                console.log('Да, видео сообщение');
                // Если вложение - аудио
                // Обработка аудиофайла, сохранение на сервере и т.д.
            } else if (attachment instanceof DocumentAttachment) {
                console.log('Да, это сообщение с документом');
                // Если вложение - аудио
                // Обработка аудиофайла, сохранение на сервере и т.д.
            } else if (attachment instanceof StickerAttachment) {
                console.log('Да, стикер');
                // Если вложение - аудио
                // Обработка аудиофайла, сохранение на сервере и т.д.
            } else if (attachment instanceof LinkAttachment) {
                console.log('Да, это ссылка');
                // Если вложение - аудио
                // Обработка аудиофайла, сохранение на сервере и т.д.
            } else if (attachment instanceof AudioAttachment) {
                console.log('Да, аудио сообщение');
                // Если вложение - аудио
                // Обработка аудиофайла, сохранение на сервере и т.д.
            }

            // Другие типы вложений можно обработать аналогичным образом
            return attachmentData;
        }


         const fileUrl = await vkBot.getAttachmentUrl(fileId);
        const filePath = `uploads/${fileId}.jpg`;

        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, response.data);

        return filePath;
    } */
}
