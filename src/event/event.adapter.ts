import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import * as qrcode from 'qrcode-terminal';

export class SocketAdapter extends IoAdapter {
    createIOServer(
        port: number,
        options?: ServerOptions & {
            namespace?: string;
            server?: any;
        },
    ) {
        const server = super.createIOServer(port, { ...options, cors: true });
        return server;
    }
}

export class SocketWhatsapp {
    private static instance: SocketWhatsapp;
    private socket: Socket;

    private constructor() {
        this.initSocket();
    }

    private initSocket() {
        this.socket = io('http://localhost:3001'); // Адрес сервера WhatsApp

        this.socket.on('connect', () => {
            console.log('✅ Connected to WhatsApp server');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from WhatsApp server:', reason);
        });

        this.socket.on('qr', (qr: string) => {
            console.log('📷 QR Code received');
            // Можно вывести QR-код в консоль
            qrcode.generate(qr, { small: true }); // Генерация QR-кода в терминале
        });

        this.socket.on('ready', () => {
            console.log('🚀 WhatsApp bot is ready');
        });

        this.socket.on('disconnected', (reason: string) => {
            console.log('🔌 WhatsApp bot disconnected:', reason);
        });
    }

    public static getInstance(): SocketWhatsapp {
        if (!SocketWhatsapp.instance) {
            SocketWhatsapp.instance = new SocketWhatsapp();
        }
        return SocketWhatsapp.instance;
    }

    public getSocket(): Socket {
        return this.socket;
    }
}
