import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import * as crypto from 'crypto';
import * as querystring from 'querystring';
import { api } from 'zadarma';

import * as dotenv from 'dotenv';
dotenv.config();

const { NOVOFON_USER_KEY, NOVOFON_SECRET_KEY } = process.env;

interface QueryParams {
    company_name: string;
    board_id: string;
    list_id: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    card_deal_num: string;
    card_deal_title: string;
    card_deal_price: string;
    card_deal_left_cost: string;
    card_deal_payed_money: string;
    card_deal_status: string;
    card_deal_pay_url: string;
    card_deal_url: string;
    card_client_url: string;
    card_deal_manager: string;
    card_deal_manager_email: string;
    card_utm_source: string;
    card_utm_medium: string;
    card_utm_campaign: string;
    card_utm_content: string;
    card_utm_term: string;
    card_deal_created: string;
    card_deal_payed: string;
}

@Controller('integration')
export class IntegrationController {
    constructor(private integrationService: IntegrationService) {}

    @Get('/getcourse/order/new')
    getcourseNewOrder(
        @Query()
        query: QueryParams,
    ) {
        return this.integrationService.getcourseNewOrder(query);
    }

    @Get('/getcourse/order/status')
    getcourseStatusOrder(
        @Query()
        query: {
            card_deal_num: string;
            card_deal_status: string;
        },
    ) {
        console.log('старт изменение из геткурса статуса');
        return this.integrationService.getcourseStatusOrder(query);
    }

    @Get('/getcourse/order/check')
    getcourseCheckOrder(
        @Query()
        query: QueryParams,
    ) {
        console.log(query);
        //return this.integrationService.getcoursePaidOrder(query);
    }

    @Get('/getcourse/bothelp')
    getCourse(@Query() query: { phone: string; email: string }) {
        return this.integrationService.checkUserFromBh(query);
    }

    @Get('/novofon')
    getNovofon(@Query() query) {
        console.log('Уведомление ', query);
    }

    @Get('/novofon/get')
    novofonGet(@Query() query) {
        const getMethod = async (query) => {
            let dataObj = await api({
                api_method: query,
                api_user_key: NOVOFON_USER_KEY,
                api_secret_key: NOVOFON_SECRET_KEY,
            });
            console.log(dataObj);
            return dataObj;
        };
        return getMethod(query);
    }
    @Get('/novofon/callback')
    novofonPost(@Query() query) {
        const callback = async (query) => {
            console.log('query', query);
            console.log('query.from', query.from);
            console.log('query.to', query.to);
            console.log('query.sip', query.sip);
            let response = await api({
                api_method: '/v1/request/callback/',
                api_user_key: NOVOFON_USER_KEY,
                api_secret_key: NOVOFON_SECRET_KEY,
                params: {
                    from: query.from,
                    to: query.to,
                    sip: query.sip,
                    /* predicted: query.predicted, */
                },
            });
            console.log('response', response);
            return response;
        };
        return callback(query);
    }
}
