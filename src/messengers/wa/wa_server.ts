// wa-server.ts - независимый процесс для работы с WhatsApp
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import * as express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Attachment } from 'vk-io';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const waBot = new Client({
    webVersionCache: {
        type: 'remote',
        remotePath:
            'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.51.html',
    },
    puppeteer: { args: ['--no-sandbox'] },
});

waBot.on('qr', (qr) => {
    console.log('QR Code received');
    io.emit('qr', qr);
});

waBot.on('ready', () => {
    console.log('✅ WhatsApp bot is ready');
    io.emit('ready');
});

waBot.on('disconnected', (reason) => {
    console.log('❌ WhatsApp bot disconnected:', reason);
    io.emit('disconnected', reason);
    setTimeout(() => waBot.initialize(), 5000); // Перезапуск через 5 сек.
});

// 📩 Получение сообщений
/* waBot.on('message', async (msg) => {
    console.log('отработало событие message', msg);

    
}); */

waBot.on('message_create', async (msg) => {
    console.log('отработало событие message_create', msg);

    if (msg.fromMe) {
        //@ts-ignore
        if (!msg._data.notifyName) {
            console.log('да сообщение с web и CRM');
            return;
        }

        const messageData = {
            from: msg.from,
            to: msg.to,
            body: msg.body,
            id: msg.id._serialized,
            hasMedia: msg.hasMedia,
            attachments: null,
        };

        /* if (msg.hasMedia) {
            try {
                const media = await msg.downloadMedia();
                console.log('media в message_create', media)
                messageData.attachments = {
                    mimeType: media.mimetype,
                    data: media.data, // base64
                    filename: msg.body || `file_${Date.now()}`,
                };
            } catch (error) {
                console.error('Ошибка при загрузке медиа:', error);
            }
        } */

        io.emit('message_from_main', messageData);
    } else {
        const messageData = {
            from: msg.from,
            body: msg.body,
            id: msg.id._serialized,
            hasMedia: msg.hasMedia,
            attachments: [],
            //@ts-ignore
            name: msg._data.notifyName ? msg._data.notifyName : '',
        };

        console.log('messageData', messageData);

        if (msg.hasMedia) {
            try {
                const media = await msg.downloadMedia();

                console.log('media', media);
                messageData.attachments.push({
                    mimetype: media.mimetype,
                    buffer: media.data, // base64
                    originalname: `file_${Date.now()}.jpg`,
                    filesize: media.filesize,
                });
            } catch (error) {
                console.error('Ошибка при загрузке медиа:', error);
            }
        }

        io.emit('message', messageData);
    }
});

// 📤 ОТПРАВКА сообщений от основного сервера через WebSocket
io.on('connection', (socket) => {
    console.log('🔌 New WebSocket connection');

    socket.on('sendMessage', async (msg) => {
        try {
            await waBot.sendMessage(msg.messenger_id, msg.message_value);
            await new Promise((resolve) => setTimeout(resolve, 500)); // Задержка
            if (msg.attachments.length > 0) {
                for (const attachment of msg.attachments) {
                    const { mimeType, buffer, filename } = attachment;
                    const media = new MessageMedia(mimeType, buffer.toString('base64'), filename);
                    const options = {
                        caption: '',
                        filename: filename,
                        sendMediaAsDocument: !mimeType.startsWith('image'),
                    };
                    await waBot.sendMessage(msg.messenger_id, media, options);
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // Задержка
                }
            }
        } catch (error) {
            console.error('❌ Ошибка при отправке сообщения через waBot:', error);
        }
    });

    socket.on('checkPhoneNumber', async (phoneNumber, callback) => {
        try {
            const isRegistered = await waBot.isRegisteredUser(phoneNumber);
            callback({ status: 'success', isRegistered });
        } catch (error) {
            callback({ status: 'error', message: error.message });
        }
    });
});

// 🔄 Проверка статуса сервера
app.get('/status', (req, res) => {
    res.json({ status: 'running' });
});

server.listen(3001, () => {
    console.log('🚀 wa-server listening on port 3001');
});

waBot.initialize();
