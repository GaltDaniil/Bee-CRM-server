import { Injectable } from '@nestjs/common';
import { Contact } from './contacts.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateContactDto } from './dto/create-contact.dto';

import { customAlphabet } from 'nanoid';
import { Chat } from 'src/chats/chats.model';
import { Card } from 'src/cards/cards.model';

const nanoid = customAlphabet('abcdef123456789', 24);

@Injectable()
export class ContactsService {
    constructor(
        @InjectModel(Contact) private contactRepository: typeof Contact,
        @InjectModel(Chat) private chatRepository: typeof Chat,
    ) {}

    async createContact(dto: CreateContactDto) {
        //@ts-ignore
        dto.contact_id = nanoid();

        const contact = await this.contactRepository.create(dto);
        return contact;
    }

    async isAlreadyContact(messenger_id, messenger_type) {
        return {};
    }

    async getOneContactByEmail(email) {
        const contacts = await this.contactRepository.findOne({ where: { contact_email: email } });
        return contacts;
    }

    async getPartContacts(limit) {
        try {
            const contactsPart = await this.contactRepository.findAll({
                limit,
                logging: false,
                order: [['updatedAt', 'DESC']],
            });
            return contactsPart;
        } catch (error) {
            console.log('ошибка при загрузки части контактов', error);
        }
    }

    async getAllContacts() {
        const contacts = await this.contactRepository.findAll();
        return contacts;
    }
    async getOneContact(id: string) {
        const contacts = await this.contactRepository.findOne({
            where: { contact_id: id },
            include: [{ model: Card }, { model: Chat }],
        });
        return contacts;
    }

    async getAllContactsDemo() {
        const contacts = await this.contactRepository.findAll();
        return contacts;
    }
}
