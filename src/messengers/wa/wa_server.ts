// wa-server.ts - независимый процесс для работы с WhatsApp
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

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

        io.emit('message_from_main', {
            from: msg.from,
            to: msg.to,
            body: msg.body,
            id: msg.id._serialized,
        });
    } else {
        io.emit('message', {
            from: msg.from,
            body: msg.body,
            id: msg.id._serialized,
        });
    }
});

// 📤 ОТПРАВКА сообщений от основного сервера через WebSocket
io.on('connection', (socket) => {
    console.log('🔌 New WebSocket connection');

    socket.on('sendMessage', async (msg) => {
        console.log('📤 Получено сообщение от основного сервера:', msg);

        try {
            await waBot.sendMessage(msg.messenger_id, msg.message_value);
            console.log('✅ Сообщение отправлено:', msg.messenger_id, msg.message_value);
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
