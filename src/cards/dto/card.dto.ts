export class CreateCardDto {
    card_id: string;
    board_id: string;
    list_id: string;
    card_deal_num?: string;
    card_deal_title?: string;
    card_deal_description?: string;
    card_deal_price?: string;
    card_deal_left_cost?: string;
    card_deal_payed_money?: string;
    card_deal_status?: string;
    card_deal_pay_url?: string;
    card_deal_url?: string;
    card_client_url?: string;
    card_deal_manager?: string;
    card_deal_manager_email?: string;
    card_deal_files?: string[];
    card_utm_source?: string;
    card_utm_medium?: string;
    card_utm_campaign?: string;
    card_utm_content?: string;
    card_utm_term?: string;
    card_deal_created?: string;
    card_deal_payed?: string;
    memberIds?: string[];
    card_deal_offers?: string[];
}
export class CreateCardFromBeeDto {
    card_id: string;
    board_id: string;
    list_id: string;
    contact_id: string;
    chat_id: string;
    card_deal_offers?: string[];
    contact_email: string;
    contact_first_name: string;
    contact_last_name: string;
    contact_phone: string;
}

export class UpdateCardDto {
    card_id?: string;
    list_id?: string;
    card_deal_num?: string;
    card_deal_title?: string;
    card_deal_description?: string;
    card_deal_price?: string;
    card_deal_left_cost?: string;
    card_deal_payed_money?: string;
    card_deal_status?: string;
    card_deal_pay_url?: string;
    card_deal_url?: string;
    card_client_url?: string;
    card_deal_manager?: string;
    card_deal_manager_email?: string;
    card_deal_files?: string[];
    card_utm_source?: string;
    card_utm_medium?: string;
    card_utm_campaign?: string;
    card_utm_content?: string;
    card_utm_term?: string;
    card_deal_created?: string;
    card_deal_payed?: string;
    memberIds?: string[];
}

export class UpdateCardStatusDto {
    card_deal_num: string;
    card_deal_status: string;
    list_id?: string;
    card_deal_left_cost?: string;
    card_deal_payed_money?: string;
    card_deal_manager_email?: string;
    card_deal_payed?: string;
    memberIds?: string[];
}
