import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { format } from 'date-fns';
import { InjectModel } from '@nestjs/sequelize';
import { Contact } from 'src/contacts/contacts.model';

import { CardsService } from 'src/cards/cards.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('abcdef123456789', 24);

dotenv.config();

const { GC_DOMAIN, BH_CLIENT_ID, BH_CLIENT_SECRET, GC_SECRET_KEY } = process.env;

@Injectable()
export class IntegrationService {
    constructor(
        private contactsService: ContactsService,
        private CardsService: CardsService,
        @InjectModel(Contact) private contactRepository: typeof Contact,
    ) {}

    async createLeadFromBS(body) {
        try {
            const {
                name,
                phone,
                email,
                created_at,
                user_id,
                bothelp_user_id,
                utm_source,
                utm_campaign,
                utm_medium,
                utm_content,
                messenger_username,
                age,
            } = body;
            let contact_id;
            const contact = await this.contactsService.getOneContactByEmail(email);
            if (!contact) {
                const dto = {
                    contact_name: name,
                    contact_phone: phone,
                    contact_email: email,
                    account_id: 'ecfafe4bc756935e17d93bec',
                    contact_photo_url: '',
                    utm_source: utm_source ? utm_source : '',
                    utm_campaign: utm_campaign ? utm_campaign : '',
                    utm_medium: utm_medium ? utm_medium : '',
                    utm_content: utm_content ? utm_content : '',
                };
                const newContact = await this.contactsService.createContact(dto);
                contact_id = newContact.contact_id;
            } else {
                contact_id = contact.contact_id;
            }
            const dto = {
                card_id: '',
                board_id: 'efp6oQLphst4WnM_en6yt',
                list_id: '6tzqBLo1sxR8BCCB5XHGp',
                contact_id: contact_id,
                card_deal_num: ' ',
                card_deal_title: 'Практикум Быстрый старт>',
                card_client_url: `https://nutrikitchen.bothelp.io/flow2/people/${bothelp_user_id}`,
                card_utm_source: utm_source ? utm_source : '',
                card_utm_campaign: utm_campaign ? utm_campaign : '',
                card_utm_medium: utm_medium ? utm_medium : '',
                card_utm_content: utm_content ? utm_content : '',
            };
            const deal = await this.CardsService.createCardFromBh(dto);
            return deal;
        } catch (error) {
            console.log(error);
        }
    }

    async getcourseNewOrder(query) {
        const { board_id, contact_name, contact_phone, contact_email, card_deal_num } = query;

        let contact_id, status_list_id;
        //Проверить есть ли такой клиент уже в базе.

        const contact = await this.contactRepository.findOne({
            where: { contact_email },
        });
        if (!contact) {
            const new_contact_id = nanoid();
            const newContact = await this.contactsService.createContact({
                contact_id: new_contact_id,
                contact_name,
                contact_email,
                contact_photo_url: '',
                contact_phone,
                account_id: 'ecfafe4bc756935e17d93bec',
            });
            query.contact_id = newContact.contact_id;
        } else {
            query.contact_id = contact.contact_id;
        }

        const card = await this.CardsService.getCardByNum(card_deal_num);

        if (!card) {
            console.log(
                'перед запуском создания карты в this.CardsService.createCard(board_id, query)',
            );
            this.CardsService.createCardFromGc(query);
        }
    }

    async getcourseStatusOrder(query) {
        console.log('getcourseStatusOrder', query);
        const card = await this.CardsService.updateCardStatusfromGetcourse(query);
        return card;
    }
    async getcourseChangeStatusOrder(query) {}

    async updateGetcourseUserByEmail(email: string, chatId: string) {
        const data = {
            user: {
                email: email,
                custom_fields: {
                    'ID переписки': chatId,
                },
            },
            system: {
                refresh_if_exists: 1,
            },
        };

        /* const jsonData = JSON.stringify(data);
        const base64Data = Buffer.from(jsonData).toString('base64'); */

        /* const apiUrl = `https://linnik-fitness1.getcourse.ru/pl/api/users`; */

        /* axios
            .post(
                apiUrl,
                `action=add&key=${GC_SECRET_KEY}&params=${encodeURIComponent(base64Data)}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            )
            .then((response) => {
                if (response.data.success) {
                    console.log('User updated successfully:', response.data);
                } else {
                    console.error('Error updating user:', response.data);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            }); */

        const params = Buffer.from(JSON.stringify(data)).toString('base64');

        const result = await axios.post(
            `https://${GC_DOMAIN}.getcourse.ru/pl/api/users`,
            {
                action: 'add',
                key: GC_SECRET_KEY,
                params: params,
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        );
    }
}

//Интеграция с геткурсом
