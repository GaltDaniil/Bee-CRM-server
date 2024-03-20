import { Controller, Get, Query } from '@nestjs/common';
import { IntegrationService } from './integration.service';

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
}
