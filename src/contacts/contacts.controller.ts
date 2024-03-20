import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateContactDto } from './dto/create-contact.dto';
import { Contact } from './contacts.model';

@Controller('contacts')
export class ContactsController {
    constructor(private contactsService: ContactsService) {}

    @Post()
    create(@Body() userDto: CreateContactDto) {
        return this.contactsService.createContact(userDto);
    }

    @Get()
    getAll() {
        return this.contactsService.getAllContacts();
    }
    @Get(':id')
    getOneContact(@Param('id') id: string) {
        return this.contactsService.getOneContact(id);
    }
}
