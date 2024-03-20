import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chat')
export class ChatsController {
    constructor(private chatsService: ChatsService) {}

    @Get()
    getAllChats() {
        return this.chatsService.getAllChats();
    }
    @Get('bycontact/:id')
    getChatByContactId(@Param('id') id: string) {
        return this.chatsService.getChatByContactId(id);
    }
    @Get('user/:id')
    getUserById(@Param('id') id: string) {
        return this.chatsService.getUserById(id);
    }
    @Get('contact/:id')
    getContactByChatId(@Param('id') id: string) {
        return this.chatsService.getContactById(id);
    }

    @Get('/chats')
    getAllChatsDemo() {
        return this.chatsService.getAllChatsDemo();
    }

    /*  @Get('/contacts')
    getContactsWithChats() {
        return this.chatsService.getContactsWithChats();
    } */

    @Get(':id')
    getChatById(@Param('id') id: string) {
        return this.chatsService.getChatById(id);
    }

    @Post()
    createChat(@Body() dto: CreateChatDto) {
        return this.chatsService.createChat(dto);
    }

    /* @Put(':id')
    updateChat(@Param('id') id: string, @Body() dto: UpdateChatDto) {
        return this.chatsService.updateChat(id, dto);
    } */

    @Delete(':id')
    deleteChat(@Param('id') id: string) {
        return this.chatsService.deleteChat(id);
    }

    @Patch(':id/read-all')
    readAllMessages(@Param('id') id: string) {
        return this.chatsService.readAllMessages(id);
    }
}
