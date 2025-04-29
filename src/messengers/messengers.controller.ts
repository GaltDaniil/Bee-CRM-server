import { Controller, Get, Query } from '@nestjs/common';
import { MessengersService } from './messengers.service';

@Controller('messengers')
export class MessengersController {
    constructor(private messagesService: MessengersService) {}

    @Get('check')
    async checkNumber(@Query('phone') phone: string) {
        return {
            telegram: await this.messagesService.checkTelegram(phone),
            whatsapp: await this.messagesService.checkWhatsapp(phone),
            viber: await this.messagesService.checkViber(phone),
        };
    }
}
