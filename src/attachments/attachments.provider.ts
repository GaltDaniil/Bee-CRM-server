import { forwardRef, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { FilesService } from 'src/files/files.service';
import { VkService } from 'src/messengers/vk/vk.service';
import { tgBot } from 'src/messengers/bots.init';
import { nanoid } from 'nanoid';

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
import {
    CreateAttachmentDto,
    MessengerAttachment,
    MessengerAttachments,
} from './dto/attachment.dto';

@Injectable()
export class AttachmentsProvider {
    // ВК

    constructor(
        private filesService: FilesService,
        private vkService: VkService,
        private telegramService: TelegramService,
        //@Inject(forwardRef(() => TelegramService)) private telegramService: TelegramService,
    ) {}

    private getFileExtensionFromUrl(url: string): string {
        const match = url.match(/\.([a-z0-9]+)(?:[?#]|$)/i);
        return match ? `.${match[1].toLowerCase()}` : '';
    }

    async crmParser(attachments) {
        try {
            console.log('crmParser');
            const result: MessengerAttachment[] = [];
            let params: MessengerAttachment;
            for (const attachment of attachments) {
                let file_type;
                if (attachment.mimetype === 'image/jpeg') {
                    file_type = 'image';
                }
                const extension = this.getFileExtensionFromUrl(attachment.originalname);
                params = {
                    file_id: `attachment_${nanoid()}`,
                    file_name: attachment.originalname,
                    file_extension: extension, // Обычно thumbnail — это изображение
                    file_type: file_type ? file_type : attachment.mimetype,
                    file_size: attachment.size,
                    file_src: '',
                    payload: {},
                };

                console.log('crmParser buffer and params', attachment.buffer, params);
                const fileData = await this.filesService.saveFile(
                    attachment.buffer,
                    params.file_name,
                    params.file_type,
                );
                params.file_src = fileData.attachment_src;

                if (params) {
                    result.push(params);
                }
            }

            return result;
        } catch (error) {}
    }
    async waParser(attachments) {
        try {
            console.log('waParser');
            console.log('attachments в waParser', attachments);
            const result: MessengerAttachment[] = [];
            let params: MessengerAttachment;

            for (const attachment of attachments) {
                let file_type;
                if (attachment.mimetype === 'image/jpeg') {
                    file_type = 'image';
                }
                /* if (file_type === 'image' && !this.validateImage(attachment.buffer)) {
                    console.warn('Invalid image data, skipping file:', attachment.originalname);
                    continue;
                } */
                const extension = this.getFileExtensionFromUrl(attachment.originalname);
                params = {
                    file_id: `attachment_${nanoid()}`,
                    file_name: attachment.originalname,
                    file_extension: extension, // Обычно thumbnail — это изображение
                    file_type: file_type ? file_type : attachment.mimetype,
                    file_size: attachment.filesize,
                    file_src: '',
                    payload: {},
                };

                console.log('crmParser buffer and params', attachment.buffer, params);
                const buffer = Buffer.from(attachment.buffer, 'base64');
                const fileData = await this.filesService.saveFile(
                    buffer,
                    params.file_name,
                    params.file_type,
                );
                params.file_src = fileData.attachment_src;

                if (params) {
                    result.push(params);
                }
            }
            console.log('результат waParser', result);
            return result;
        } catch (error) {}
    }

    async vkParser(attachments): Promise<MessengerAttachments> {
        try {
            console.log('vkParser');
            const result: MessengerAttachment[] = [];
            let buffer;
            let params: MessengerAttachment;

            for (const attachment of attachments) {
                if (attachment instanceof MarketAttachment) {
                    console.log('Прилетела с ВК - товар');

                    buffer = await axios.get(attachment.thumbnailUrl, {
                        responseType: 'arraybuffer',
                    });
                    params = {
                        file_id: `market_${attachment.id}_${attachment.ownerId}`,
                        file_name: attachment.title,
                        file_extension: '.jpg', // Обычно thumbnail — это изображение
                        file_type: 'market',
                        file_size: undefined,
                        file_src: attachment.thumbnailUrl,
                        payload: {
                            price: attachment.price.text,
                            title: attachment.title,
                            description: attachment.description,
                            photo_url: attachment.thumbnailUrl,
                        },
                    };
                } else if (attachment instanceof PhotoAttachment) {
                    console.log('Прилетела с ВК - фоточка');

                    const largestSize = attachment.sizes.reduce(
                        (max, size) => (size.width > max.width ? size : max),
                        attachment.sizes[0],
                    );
                    buffer = await axios.get(largestSize.url, { responseType: 'arraybuffer' });
                    params = {
                        file_id: `photo_${attachment.id}_${attachment.ownerId}`,
                        file_name: `photo_${attachment.id}_${attachment.ownerId}.jpg`,
                        file_extension: '.jpg',
                        file_type: 'image',
                        file_size: largestSize.width * largestSize.height, // Примерный размер
                        file_src: largestSize.url,
                        payload: {
                            width: largestSize.width,
                            height: largestSize.height,
                        },
                    };
                } else if (attachment instanceof AudioMessageAttachment) {
                    console.log('Прилетела с ВК - войз');

                    buffer = await axios.get(attachment.url, { responseType: 'arraybuffer' });
                    params = {
                        file_id: `audio_message_${attachment.id}_${attachment.ownerId}`,
                        file_name: `audio_message_${attachment.id}_${attachment.ownerId}.mp3`,
                        file_extension: '.mp3',
                        file_type: 'audio',
                        file_src: attachment.url,
                        file_size: attachment.duration * 32000, // Примерный размер (320kbps)
                        payload: {
                            duration: attachment.duration,
                        },
                    };
                } else if (attachment instanceof VideoAttachment) {
                    console.log('Прилетела с ВК - видео');
                    /* params = {
                        file_id: `video_${attachment.id}_${attachment.ownerId}`,
                        file_name:
                            attachment.title || `video_${attachment.id}_${attachment.ownerId}.mp4`,
                        file_extension: '.mp4',
                        file_type: 'video',
                        file_size: attachment.fileSize,
                        payload: {
                            duration: attachment.duration,
                            width: attachment.width,
                            height: attachment.height,
                        },
                    }; */
                } else if (attachment instanceof DocumentAttachment) {
                    console.log('Прилетела с ВК - док');
                    const fileExt =
                        attachment.extension || this.getFileExtensionFromUrl(attachment.url) || '';

                    buffer = await axios.get(attachment.url, { responseType: 'arraybuffer' });
                    params = {
                        file_id: `doc_${attachment.id}_${attachment.ownerId}`,
                        file_name: attachment.title,
                        file_extension: fileExt,
                        file_type: 'document',
                        file_size: attachment.size,
                        file_src: attachment.url,
                        payload: {},
                    };
                } else if (attachment instanceof StickerAttachment) {
                    console.log('Прилетела с ВК - стикер');
                    params = {
                        file_id: `sticker_${attachment.id}`,
                        file_name: `sticker_${attachment.id}.png`,
                        file_extension: '.png',
                        file_type: 'sticker',
                        file_size: undefined,
                        payload: {},
                    };
                } else if (attachment instanceof LinkAttachment) {
                    console.log('Прилетела с ВК - ссылка');
                    params = {
                        file_id: `link_${attachment.url}`,
                        file_name: attachment.title || attachment.url,
                        file_extension: '',
                        file_type: 'link',
                        file_size: undefined,
                        payload: {
                            caption: attachment.description || attachment.title,
                        },
                    };
                } else if (attachment instanceof AudioAttachment) {
                    console.log('Прилетела с ВК - аудио');

                    buffer = await axios.get(attachment.url, { responseType: 'arraybuffer' });
                    params = {
                        file_id: `audio_${attachment.id}_${attachment.ownerId}`,
                        file_name:
                            attachment.title || `audio_${attachment.id}_${attachment.ownerId}.mp3`,
                        file_extension: '.mp3',
                        file_type: 'audio',
                        file_size: undefined,
                        payload: {
                            duration: attachment.duration,
                        },
                    };
                } /* else if (message_from === 'crm') {
                    console.log('Да, сообщение в ВК получено из CRM');

                    const tempFilePath = await this.filesService.tempFiles(attachment);
                    console.log('tempFilePath', tempFilePath);
                    const { url, extension } = await this.uploadAndSendDocument(
                        tempFilePath,
                        messenger_id,
                    );

                    params = {
                        file_name: attachment.originalname,
                        file_src: url,
                        file_type: 'document',
                        file_extension: attachment.extension || extension,
                    };
                } */

                console.log('buffer and params', buffer.data, params);
                const fileData = await this.filesService.saveFile(
                    buffer.data,
                    params.file_name,
                    params.file_type,
                );
                params.file_src = fileData.attachment_src;

                if (params) {
                    result.push(params);
                }
            }
            return result;
        } catch (error) {
            console.error('Ошибка при разборе вложений:', error);
            throw error;
        }
    }

    async convertToDtoAttachment(attachments: MessengerAttachments) {
        console.log('attachments', attachments);
        try {
            let attachmentData: CreateAttachmentDto[] = [];
            let params;

            for (const attachment of attachments) {
                params = {
                    attachment_name: attachment.file_name,
                    attachment_type: attachment.file_type,
                    attachment_src: attachment.file_src,
                    attachment_payload: {
                        price: attachment.payload.price ? attachment.payload.price : '',
                        title: attachment.payload.title ? attachment.payload.title : '',
                        caption: attachment.payload.caption ? attachment.payload.caption : '',
                        reply_message_id: attachment.payload.reply_message_id
                            ? attachment.payload.reply_message_id
                            : '',
                        reply_text: attachment.payload.reply_text
                            ? attachment.payload.reply_text
                            : '',
                        reply_from: attachment.payload.reply_from
                            ? attachment.payload.reply_from
                            : {},
                        description: attachment.payload.description
                            ? attachment.payload.description
                            : '',
                        photo_url: attachment.payload.photo_url ? attachment.payload.photo_url : '',
                        duration: attachment.payload.duration
                            ? attachment.payload.duration
                            : undefined,
                        width: attachment.payload.width ? attachment.payload.width : undefined,
                        height: attachment.payload.height ? attachment.payload.height : undefined,
                    },
                };
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

    async vkAttachmentsParser(attachments: MessengerAttachments) {
        console.log('attachments', attachments);
        try {
            let attachmentData: CreateAttachmentDto[] = [];
            let params;

            for (const attachment of attachments) {
                params = {
                    attachment_name: attachment.file_name,
                    attachment_type: attachment.file_type,
                    attachment_src: attachment.file_src,
                    attachment_payload: {
                        price: attachment.payload.price ? attachment.payload.price : '',
                        title: attachment.payload.title ? attachment.payload.title : '',
                        caption: attachment.payload.caption ? attachment.payload.caption : '',
                        reply_message_id: attachment.payload.reply_message_id
                            ? attachment.payload.reply_message_id
                            : '',
                        reply_text: attachment.payload.reply_text
                            ? attachment.payload.reply_text
                            : '',
                        reply_from: attachment.payload.reply_from
                            ? attachment.payload.reply_from
                            : {},
                        description: attachment.payload.description
                            ? attachment.payload.description
                            : '',
                        photo_url: attachment.payload.photo_url ? attachment.payload.photo_url : '',
                        duration: attachment.payload.duration
                            ? attachment.payload.duration
                            : undefined,
                        width: attachment.payload.width ? attachment.payload.width : undefined,
                        height: attachment.payload.height ? attachment.payload.height : undefined,
                    },
                };
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
                if (file.file_type === 'reply') {
                    console.log('Да это reply');
                    params = {
                        attachment_name: 'reply',
                        attachment_type: 'reply',
                        attachment_src: 'reply',
                        attachment_payload: {
                            reply_message_id: file.payload.reply_message_id,
                            reply_text: file.payload.reply_text,
                            reply_from: {
                                id: file.payload.reply_from.id,
                                first_name: file.payload.reply_from.first_name,
                                username: file.payload.reply_from.username,
                                is_bot: file.payload.reply_from.is_bot,
                            },
                        },
                    };
                    console.log('reply params', params);
                } else {
                    let { filePath, attachment_src } =
                        await this.telegramService.downloadAndSaveTgFile(file);

                    params = {
                        attachment_name: file.file_name,
                        attachment_src: attachment_src,
                        attachment_extension: file.file_extension,
                        attachment_type: file.file_type,
                    };
                }

                attachmentData.push(params);
            } catch (error) {
                console.error(`❌ Ошибка при скачивании файла ${file.file_name}:`, error);
            }
        }
        console.log('attachmentData в telegramAttachmentsParser', attachmentData);
        return attachmentData;
    }
    private validateImage(buffer: Buffer): boolean {
        if (!buffer || buffer.length < 8) return false;

        // Проверка сигнатур популярных форматов
        const signatures = {
            jpg: [0xff, 0xd8, 0xff],
            png: [0x89, 0x50, 0x4e, 0x47],
            webp: [0x52, 0x49, 0x46, 0x46],
        };

        const header = buffer.subarray(0, 8);
        return Object.values(signatures).some((sig) => {
            return sig.every((byte, i) => header[i] === byte);
        });
    }
}
