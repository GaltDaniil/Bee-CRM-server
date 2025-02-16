import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { FilesService } from 'src/files/files.service';
import { VkService } from 'src/messengers/vk/vk.service';

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
export class AttachmentsProvider {
    // ВК

    constructor(
        //@Inject(forwardRef(() => VkService)) private vkService: VkService,
        private filesService: FilesService,
    ) {}

    async vkAttachmentsParser(attachments, message_from) {
        console.log('message_from', message_from);
        try {
            let attachmentData = [];
            let params;
            for (const attachment of attachments) {
                if (attachment instanceof MarketAttachment) {
                    console.log('Да, это товар', attachment);
                    const attachmentWithType = attachment as MarketAttachment;
                    const attachment_market = {
                        price: attachmentWithType.price.text,
                        title: attachmentWithType.title,
                        description: attachmentWithType.description,
                        photo_url: attachmentWithType.thumbnailUrl,
                    };
                    params = {
                        attachment_name: attachmentWithType.title,
                        attachment_src: attachmentWithType.thumbnailUrl,
                        attachment_type: 'market',
                        attachment_url: ' ',
                        attachment_market,
                    };
                } else if (attachment instanceof PhotoAttachment) {
                    console.log('Да, это фоточка', attachment);
                    const attachmentWithType = attachment as PhotoAttachment;
                    const attachment_url = attachment.sizes.find((size) => size.type === 'x')?.url; // Выбираем URL среднего размера изображения
                    params = {
                        attachment_name: attachmentWithType.id.toString(),
                        attachment_src: attachment_url,
                        attachment_type: 'image',
                        attachment_url,
                        attachment_market: {},
                    };
                    return;
                } else if (attachment instanceof AudioMessageAttachment) {
                    console.log('Да, это голосовое');
                    // Если вложение - аудио
                    // Обработка аудиофайла, сохранение на сервере и т.д.
                } else if (attachment instanceof VideoAttachment) {
                    console.log('Да, видео сообщение');
                    // Если вложение - аудио
                    // Обработка аудиофайла, сохранение на сервере и т.д.
                } else if (attachment instanceof DocumentAttachment) {
                    console.log('Да, это сообщение с документом', attachment);
                    const attachmentWithType = attachment as DocumentAttachment;
                    params = {
                        attachment_name: attachmentWithType.title,
                        attachment_src: attachmentWithType.url,
                        attachment_type: 'document',
                        attachment_url: attachmentWithType.url,
                        attachment_extension: attachment.extension,
                        attachment_market: {},
                    };
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

                if (params) {
                    attachmentData.push(params);
                }
            }
            return attachmentData;
        } catch (error) {
            console.error('Ошибка при разборе вложений:', error);
            throw error;
        }
    }

    async telegramAttachmentsParser() {}
}
