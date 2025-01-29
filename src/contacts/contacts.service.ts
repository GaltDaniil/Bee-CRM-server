import { Injectable, NotFoundException } from '@nestjs/common';
import { Contact } from './contacts.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateContactDto, UpdateContactDto } from './dto/create-contact.dto';

import { customAlphabet } from 'nanoid';
import { Chat } from 'src/chats/chats.model';
import { Card } from 'src/cards/cards.model';
import { Op } from 'sequelize';

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
        try {
            const contact = await this.contactRepository.findOne({
                where: { contact_email: email },
                include: [{ model: Chat }],
            });
            console.log('contact contact', contact);
            return contact;
        } catch (error) {
            console.log('Не получилось найти контакт по Email', error);
        }
    }
    async searchContacts(type, value) {
        try {
            console.log('type', type, 'value', value);
            let contact;
            if (type === 'email') {
                contact = await this.contactRepository.findAll({
                    where: { contact_email: value },
                });
            } else if (type === 'name') {
                contact = await this.contactRepository.findAll({
                    where: {
                        contact_name: {
                            [Op.like]: `%${value}%`,
                        },
                    },
                });
            } else if (type === 'phone') {
                contact = await this.contactRepository.findAll({
                    where: {
                        contact_phone: {
                            [Op.like]: `%${value}%`,
                        },
                    },
                });
            }
            console.log('searchData', contact);
            return contact;
        } catch (error) {
            console.log('Не получилось найти контакт по ', type, error);
        }
    }

    async getPartContacts(limit, page) {
        try {
            if (page) {
                const offset = (page - 1) * limit; // Рассчитываем смещение
                const contactsPart = await this.contactRepository.findAll({
                    limit,
                    offset,
                    logging: false,
                    order: [['updatedAt', 'DESC']],
                });
                const totalContacts = await this.contactRepository.count();
                const totalPages = Math.ceil(totalContacts / limit);

                return {
                    contacts: contactsPart,
                    totalPages, // Общее количество страниц
                    currentPage: page, // Текущая страница
                };
            } else {
                const contactsPart = await this.contactRepository.findAll({
                    limit,
                    order: [['updatedAt', 'DESC']],
                });

                return contactsPart;
            }
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

    async updateContact(dto: UpdateContactDto) {
        try {
            const [updatedRowsCount, updatedContacts] = await this.contactRepository.update(dto, {
                where: { contact_id: dto.contact_id },
                returning: true,
            });
            if (updatedRowsCount === 0) {
                throw new NotFoundException(`Chat with id ${dto.contact_id} not found.`);
            }
            return updatedContacts[0];
        } catch (error) {
            console.log(error);
        }
    }

    async getAllContactsDemo() {
        const contacts = await this.contactRepository.findAll();
        return contacts;
    }

    async deleteContact(id: string) {
        try {
            const deletedRowsCount = await this.chatRepository.destroy({
                where: { contact_id: id },
            });

            if (deletedRowsCount === 0) {
                throw new NotFoundException(`Contact with id ${id} not found.`);
            }
            return { success: true, message: `Contact with id ${id} deleted successfully.` };
        } catch (error) {
            console.log(error);
        }
    }
}
