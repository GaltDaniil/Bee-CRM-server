import { Injectable } from '@nestjs/common';
import { ContactsService } from 'src/contacts/contacts.service';
import axios from 'axios';
import { CardsService } from 'src/cards/cards.service';
import { customAlphabet } from 'nanoid';
import * as dotenv from 'dotenv';

const nanoid = customAlphabet('abcdef123456789', 24);

dotenv.config();

const { GC_DOMAIN, BH_CLIENT_ID, BH_CLIENT_SECRET, GC_SECRET_KEY } = process.env;

@Injectable()
export class BothelpService {
    constructor(
        private contactsService: ContactsService,
        private cardsService: CardsService,
    ) {}

    async createNutriLead2Day(body) {
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
            console.log('ботхелп проверка контакта ', contact);
            if (!contact) {
                console.log('ботхелп контакта нет');
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
                console.log('ботхелп контакт есть');
                contact_id = contact.contact_id;

                //Проверить есть ли у контакта карточка с тайтлом "Практикум Кухня Нутрициолога"
                const card = contact.cards.filter(
                    (el) => el.card_deal_title === 'Практикум Кухня Нутрициолога',
                );
                if (card[0]) {
                    const dto = {
                        card_id: card[0].card_id,
                        board_id: 'efp6oQLphst4WnM_en6yt',
                        list_id: '6tzqBLo1sxR8BCCB5XHGp',
                    };
                    this.cardsService.updateCardInfo(dto);
                    return;
                }
            }
            const dto = {
                card_id: '',
                board_id: 'efp6oQLphst4WnM_en6yt',
                list_id: 'iz0btIXoFgfk8HYjcyhfV',
                contact_id: contact_id,
                card_deal_num: ' ',
                card_deal_title: 'Практикум Кухня Нутрициолога',
                card_client_url: `https://nutrikitchen.bothelp.io/flow2/people/${bothelp_user_id}`,
                card_utm_source: utm_source ? utm_source : '',
                card_utm_campaign: utm_campaign ? utm_campaign : '',
                card_utm_medium: utm_medium ? utm_medium : '',
                card_utm_content: utm_content ? utm_content : '',
            };
            const deal = await this.cardsService.createCardFromBh(dto);
            console.log('ботхелп заявка создана ', deal);
            return deal;
        } catch (error) {
            console.log(error);
        }
    }
    async createStartLead2Day(body) {
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
                list_id: 'iz0btIXoFgfk8HYjcyhfV',
                contact_id: contact_id,
                card_deal_num: ' ',
                card_deal_title: 'Практикум Быстрый старт>',
                card_client_url: `https://nutrikitchen.bothelp.io/flow2/people/${bothelp_user_id}`,
                card_utm_source: utm_source ? utm_source : '',
                card_utm_campaign: utm_campaign ? utm_campaign : '',
                card_utm_medium: utm_medium ? utm_medium : '',
                card_utm_content: utm_content ? utm_content : '',
            };
            const deal = await this.cardsService.createCardFromBh(dto);
            return deal;
        } catch (error) {
            console.log(error);
        }
    }
    async updateLeadFromBH(body) {
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
            }
            contact_id = contact.contact_id;

            const card = contact.cards.filter((el) => el.list_id === 'efp6oQLphst4WnM_en6yt');
            if (card[0]) {
                const dto = {
                    card_id: card[0].card_id,
                    list_id: '6tzqBLo1sxR8BCCB5XHGp',
                };
                this.cardsService.updateCardInfo(dto);
                return;
            } else {
                const dto = {
                    card_id: '',
                    board_id: 'efp6oQLphst4WnM_en6yt',
                    list_id: '6tzqBLo1sxR8BCCB5XHGp',
                    contact_id: contact_id,
                    card_deal_num: ' ',
                    card_deal_title: 'Практикум',
                    card_client_url: `https://nutrikitchen.bothelp.io/flow2/people/${bothelp_user_id}`,
                    card_utm_source: utm_source ? utm_source : '',
                    card_utm_campaign: utm_campaign ? utm_campaign : '',
                    card_utm_medium: utm_medium ? utm_medium : '',
                    card_utm_content: utm_content ? utm_content : '',
                };
                const deal = await this.cardsService.createCardFromBh(dto);
                return deal;
            }
        } catch (error) {
            console.log(error);
        }
    }
    async updateLeadFromBS(body) {
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
            const deal = await this.cardsService.createCardFromBh(dto);
            return deal;
        } catch (error) {
            console.log(error);
        }
    }
}
