import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { format } from 'date-fns';
import { InjectModel } from '@nestjs/sequelize';
import { Contact } from 'src/contacts/contacts.model';

import { customAlphabet } from 'nanoid';
import { CardsService } from 'src/cards/cards.service';
import { ContactsService } from 'src/contacts/contacts.service';

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

    async checkUserFromBh(query) {
        try {
            const { phone, email } = query;
            console.log('данные из GC', phone, email);

            const params = new URLSearchParams();
            params.append('grant_type', 'client_credentials');
            params.append('client_id', BH_CLIENT_ID!);
            params.append('client_secret', BH_CLIENT_SECRET!);

            const bhKeyResponse = await axios.post(
                `https://oauth.bothelp.io/oauth2/token`,
                params,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );
            const { access_token } = bhKeyResponse.data;
            if (phone) {
                const isSubscriber = await axios.get(
                    `https://api.bothelp.io/v1/subscribers?phone=${phone}`,
                    {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                        },
                    },
                );
                console.log(isSubscriber.data.data[0]);
                if (isSubscriber.data.data[0]) {
                    console.log('пользователь найден по телефону');

                    const prevParams = {
                        user: {
                            phone: phone,
                            addfields: {},
                        },
                        system: { refresh_if_exists: 1 },
                    };
                    if (isSubscriber.data.data[0].utmCampaign)
                        //@ts-ignore
                        prevParams.user.addfields.bh_utm_campaign =
                            isSubscriber.data.data[0].utmCampaign;

                    if (isSubscriber.data.data[0].utmMedium)
                        //@ts-ignore
                        prevParams.user.addfields.bh_utm_medium =
                            isSubscriber.data.data[0].utmMedium;

                    if (isSubscriber.data.data[0].utmSource)
                        //@ts-ignore
                        prevParams.user.addfields.bh_utm_source =
                            isSubscriber.data.data[0].utmSource;

                    if (isSubscriber.data.data[0].utmContent)
                        //@ts-ignore
                        prevParams.user.addfields.bh_utm_content =
                            isSubscriber.data.data[0].utmContent;

                    if (isSubscriber.data.data[0].utmTerm)
                        //@ts-ignore
                        prevParams.user.addfields.bh_utm_term = isSubscriber.data.data[0].utmTerm;

                    if (isSubscriber.data.data[0].createdAt)
                        console.log('sSubscriber.data.data', isSubscriber.data.data);

                    //@ts-ignore
                    prevParams.user.addfields.was_in_bh = `Был в BH ${format(
                        isSubscriber.data.data[0].createdAt * 1000,
                        'dd MMM HH:mm',
                    )}`;

                    const params = Buffer.from(JSON.stringify(prevParams)).toString('base64');

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
                } else {
                    if (email) {
                        const isSubscriber = await axios.get(
                            `https://api.bothelp.io/v1/subscribers?email=${email}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${access_token}`,
                                },
                            },
                        );

                        if (isSubscriber.data.data[0]) {
                            console.log('пользователь найден по почте');

                            const prevParams = {
                                user: {
                                    email: email,
                                    addfields: {},
                                },
                                system: { refresh_if_exists: 1 },
                            };
                            if (isSubscriber.data.data[0].utmCampaign)
                                //@ts-ignore
                                prevParams.user.addfields.bh_utm_campaign =
                                    isSubscriber.data.data[0].utmCampaign;

                            if (isSubscriber.data.data[0].utmMedium)
                                //@ts-ignore
                                prevParams.user.addfields.bh_utm_medium =
                                    isSubscriber.data.data[0].utmMedium;

                            if (isSubscriber.data.data[0].utmSource)
                                //@ts-ignore
                                prevParams.user.addfields.bh_utm_source =
                                    isSubscriber.data.data[0].utmSource;

                            if (isSubscriber.data.data[0].utmContent)
                                //@ts-ignore
                                prevParams.user.addfields.bh_utm_content =
                                    isSubscriber.data.data[0].utmContent;

                            if (isSubscriber.data.data[0].utmTerm)
                                //@ts-ignore
                                prevParams.user.addfields.bh_utm_term =
                                    isSubscriber.data.data[0].utmTerm;
                            if (isSubscriber.data.data[0].createdAt)
                                //@ts-ignore
                                prevParams.user.addfields.was_in_bh = `Был в BH ${format(
                                    isSubscriber.data.data[0].createdAt * 1000,
                                    'dd MMM HH:mm',
                                )}`;
                            const params = Buffer.from(JSON.stringify(prevParams)).toString(
                                'base64',
                            );

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
                    } else {
                        console.log('Почта не передана');
                    }
                }
            }
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
            this.CardsService.createCard(board_id, query);
        }
    }

    async getcourseStatusOrder(query) {
        console.log('getcourseStatusOrder', query);
        const card = await this.CardsService.updateCardStatusfromGetcourse(query);
        return card;
    }
    async getcourseChangeStatusOrder(query) {}
}
