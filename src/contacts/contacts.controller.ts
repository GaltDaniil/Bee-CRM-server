import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateContactDto, UpdateContactDto } from './dto/create-contact.dto';
import { Contact } from './contacts.model';

@Controller('contacts')
export class ContactsController {
    constructor(private contactsService: ContactsService) {}

    @Post()
    create(@Body() userDto: CreateContactDto) {
        return this.contactsService.createContact(userDto);
    }

    @Get('/part')
    getPartChats(@Query('limit') limit: number, @Query('page') page: number) {
        console.log(limit);
        return this.contactsService.getPartContacts(limit, page);
    }

    @Get('/search')
    getSearchContacts(@Query('type') type: string, @Query('value') value: string) {
        console.log('contrType', type, 'contrValue', value);
        return this.contactsService.searchContacts(type, value);
    }

    @Get()
    getAll() {
        return this.contactsService.getAllContacts();
    }

    @Get(':id')
    getOneContact(@Param('id') id: string) {
        return this.contactsService.getOneContact(id);
    }

    @Get('/findByEmail/:email')
    getOneContactByEmail(@Param('email') email: string) {
        return this.contactsService.getOneContactByEmail(email);
    }

    @Put(':id')
    updateChat(@Body() dto: UpdateContactDto) {
        return this.contactsService.updateContact(dto);
    }

    @Delete(':id')
    deleteContact(@Param(':id') id: string) {
        return this.contactsService.deleteContact(id);
    }
}
