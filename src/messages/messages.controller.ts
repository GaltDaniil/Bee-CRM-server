import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { Message } from './messages.model';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessagesController {
    constructor(private messagesService: MessagesService) {}

    @ApiOperation({ summary: 'Создание сообщения' })
    @ApiResponse({ status: 200, type: Message })
    @Post()
    create(@Body() dto: CreateMessageDto) {
        return this.messagesService.createMessage(dto);
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
}
