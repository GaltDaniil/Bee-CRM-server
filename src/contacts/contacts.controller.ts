import { Body, Controller, Get, Post } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateContactDto } from './dto/create-contact.dto';
import { Contact } from './contacts.model';

@Controller('contacts')
export class ContactsController {
    constructor(private contactsService: ContactsService) {}

    @ApiOperation({ summary: 'Создание контакта' })
    @ApiResponse({ status: 200, type: Contact })
    @Post()
    create(@Body() userDto: CreateContactDto) {
        return this.contactsService.createContact(userDto);
    }

    @ApiOperation({ summary: 'Получить все контакты' })
    @ApiResponse({ status: 200, type: [Contact] })
    @Get()
    getAll() {
        return this.contactsService.getAllContacts();
    }
}
