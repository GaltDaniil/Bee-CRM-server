import { Injectable } from '@nestjs/common';
import { Contact } from './contacts.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateContactDto } from './dto/create-contact.dto';

import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdef123456789', 24);

@Injectable()
export class ContactsService {
    constructor(@InjectModel(Contact) private contactRepository: typeof Contact) {}

    async createContact(dto: CreateContactDto) {
        //@ts-ignore
        dto.contact_id = nanoid();

        const contact = await this.contactRepository.create(dto);
        return contact;
    }

    async isAlreadyContact(messenger_id, messenger_type) {
        return {};
    }

    async getAllContacts() {
        const contacts = await this.contactRepository.findAll();
        return contacts;
    }
    async getAllContactsDemo() {
        const contacts = await this.contactRepository.findAll();
        return contacts;
    }
}
