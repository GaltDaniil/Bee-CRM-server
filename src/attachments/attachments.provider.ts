import { forwardRef, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { FilesService } from 'src/files/files.service';
import { VkService } from 'src/messengers/vk/vk.service';
import { tgBot } from 'src/messengers/bots.init';

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
import { TelegramService } from 'src/messengers/telegram/telegram.service';
import { MessengerAttachments } from './dto/attachment.dto';

@Injectable()
export class AttachmentsProvider {
    // ВК

    constructor(
        private filesService: FilesService,
        private vkService: VkService,
        private telegramService: TelegramService,
        //@Inject(forwardRef(() => TelegramService)) private telegramService: TelegramService,
    ) {}

    async vkAttachmentsParser(attachments, message_from, messenger_id) {
        console.log('message_from', message_from);
        try {
            let attachmentData = [];
            let params;
            const typeMapping = {
                photo: 'image',
                video: 'video',
                audio: 'audio',
                document: 'document',
            };
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
                } else if (message_from === 'crm') {
                    console.log('Да, сообщение получено из CRM');

                    const tempFilePath = await this.filesService.tempFiles(attachment);
                    console.log('tempFilePath', tempFilePath);
                    const { url, extension } = await this.vkService.uploadAndSendDocument(
                        tempFilePath,
                        messenger_id,
                    );

                    params = {
                        attachment_name: attachment.originalname,
                        attachment_src: url,
                        attachment_type: 'document',
                        attachment_url: url,
                        attachment_extension: attachment.extension || extension,
                        attachment_market: {},
                    };
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

    async telegramAttachmentsParser(attachments: MessengerAttachments) {
        if (!attachments || attachments.length === 0) {
            console.log('⛔ Нет файлов для обработки');
            return [];
        }

        const attachmentData = [];

        let params;

        for (const file of attachments) {
            try {
                let { filePath, attachment_src } =
                    await this.telegramService.downloadAndSaveTgFile(file);

                params = {
                    attachment_name: file.file_name,
                    attachment_src: attachment_src,
                    attachment_extension: file.file_extension,
                    attachment_type: file.file_type,
                };
                attachmentData.push(params);
            } catch (error) {
                console.error(`❌ Ошибка при скачивании файла ${file.file_name}:`, error);
            }
        }
        return attachmentData;
    }
}
