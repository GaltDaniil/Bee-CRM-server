import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { filter } from 'rxjs';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('chat')
export class ChatsController {
    constructor(private chatsService: ChatsService) {}

    @Get()
    getAllChats() {
        return this.chatsService.getAllChats();
    }

    @Get('unreadcount')
    unreadCount() {
        return this.chatsService.unreadCount();
    }

    @Get('/part')
    getPartChats(@Query('limit') limit: number, @Query('filter') filter: number) {
        console.log(limit);
        return this.chatsService.getPartChats(limit, filter);
    }
    @Get('/parttest')
    getPartChatsTest(@Query('limit') limit: number, @Query('filter') filter: number) {
        console.log(limit);
        return this.chatsService.getPartChatsTest(limit, filter);
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
    @Post()
    createChatByContact(@Body() dto: CreateChatDto) {
        return this.chatsService.createChatByContact(dto);
    }

    @Put(':id')
    updateChat(@Body() dto: UpdateChatDto) {
        return this.chatsService.updateChat(dto);
    }

    @Delete(':id')
    deleteChat(@Param('id') id: string) {
        return this.chatsService.deleteChat(id);
    }

    @Patch(':id/read-all')
    readAllMessages(@Param('id') id: string) {
        return this.chatsService.readAllMessages(id);
    }
}
