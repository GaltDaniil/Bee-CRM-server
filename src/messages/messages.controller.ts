import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { Message } from './messages.model';
import { CreateMessageDto } from './dto/create-message.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('messages')
export class MessagesController {
    constructor(private messagesService: MessagesService) {}

    /* @ApiOperation({ summary: 'Создание сообщения' })
    @ApiResponse({ status: 200, type: Message })
    @Post()
    create(@Body() dto: CreateMessageDto) {
        return this.messagesService.createMessage(dto);
    } */

    @Post()
    @UseInterceptors(FilesInterceptor('attachments')) // Обрабатываем файлы
    createMessage(@Body() dto, @UploadedFiles() files) {
        console.log('DTO:', dto); // Проверь, что тут есть все поля
        console.log('FILES:', files); // Проверь, что файлы тоже приходят
        console.log('FILES[]0:', files[0]); // Проверь, что файлы тоже приходят

        return this.messagesService.createMessage({ ...dto, attachments: files[0] });
    }

    @ApiOperation({ summary: 'Получить все сообщения' })
    @ApiResponse({ status: 200, type: [Message] })
    @Get()
    getAll() {
        return this.messagesService.getAllMessages();
    }

    @Get(':id')
    getMessagesByIdDemo(@Param('id') id: string) {
        return this.messagesService.getMessagesByIdDemo(id);
    }

    @Patch(':id/readed')
    readAllMessage(@Param('id') id: string) {
        return this.messagesService.readMessage(id);
    }
}
