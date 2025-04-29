import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io-client';
import { tgBot } from './bots.init';
import { WaService } from './wa/wa.service';
import axios from 'axios';

const config = {
    api_id: 29535205, // Ваш api_id
    api_hash: '69c8b0c74d44f4031a5d84f05b848c06', // Ваш api_hash
};

@Injectable()
export class MessengersService {
    private socket: Socket;
    private TgBot = tgBot;
    constructor(private waService: WaService) {}

    /* async checkNumber(number: string) {
        const response = { telegram: false, whatsapp: false, viber: false };

        response.telegram = await this.checkTelegram(number);

        response.whatsapp = await this.checkWhatsapp(number);

        response.viber = await this.checkViber(number);

        return response;
    } */

    ////// Проверка WhatsApp ///////

    async checkWhatsapp(contact_phone) {
        try {
            const response = await this.waService.checkNumber(contact_phone);
            return response.status;
        } catch (error) {
            console.error(`Ошибка при проверке номера ${contact_phone}:`, error);
        }
    }
    formatPhoneNumber(phoneNumber: string): string {
        phoneNumber = phoneNumber.replace(/\s/g, '');
        if (phoneNumber.startsWith('+')) {
            phoneNumber = phoneNumber.slice(1);
        }
        if (phoneNumber.startsWith('8')) {
            phoneNumber = `7${phoneNumber.slice(1)}`;
        }
        return phoneNumber;
    }
    async checkPhoneNumber(number) {
        return new Promise((resolve, reject) => {
            this.socket.emit('checkPhoneNumber', number, (response) => {
                if (response.status === 'success') {
                    resolve(response.isRegistered);
                } else {
                    reject(response.message);
                }
            });
        });
    }

    /////

    async checkWhatsapp2(number: string) {
        try {
            return new Promise((resolve, reject) => {
                this.socket.emit('checkPhoneNumber', number, (response) => {
                    if (response.status === 'success') {
                        resolve(response.isRegistered);
                    } else {
                        reject(response.message);
                    }
                });
            });
        } catch (error) {
            console.log(error);
        }
    }
    async checkTelegram(number: string) {}
    async checkViber(number: string) {
        return false;
    }
}
