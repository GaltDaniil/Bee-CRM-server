import { CardsService } from './cards.service';
import { Body, Controller, Delete, Get, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import {
    CreateCardDto,
    CreateCardFromBeeDto,
    UpdateCardDto,
    UpdateCardStatusDto,
} from './dto/card.dto';

@Controller('scrumboard/boards')
export class CardsController {
    constructor(private cardsService: CardsService) {}

    @Get(':board_id/cards/:card_id')
    getCard(@Param('id') id: string) {
        return this.cardsService.getCard(id);
    }

    /* @Post(':board_id/lists/:list_id/cards/')
    createCard(
        @Param('board_id') boardId: string,
        @Param('list_id') listId: string,
        @Body() dto: CreateCardDto,
    ) {
        return this.cardsService.createCard(boardId, dto);
    } */

    @Get(':board_id/cards/')
    getCards(@Param('board_id') board_id: string) {
        return this.cardsService.getCards(board_id);
    }

    @Post(':board_id/cards/create')
    createCard(@Body() dto: CreateCardFromBeeDto) {
        //добавляем недостающие list и board

        //Есть ли такой клиент в базе, для него же будет карточка
        //Берем email и по нему проверяем на наличие клиента

        return this.cardsService.createCard(dto);
    }

    @Put(':board_id/cards/:id/')
    updateCard(@Param('id') id: string, @Body() dto: UpdateCardStatusDto) {
        return this.cardsService.updateCardInfo(dto);
    }

    @Put(':board_id/cards/:id/status')
    updateCardStatus(@Param('id') id: string, @Body() dto: UpdateCardStatusDto) {
        return this.cardsService.updateCardStatusFromBee(id, dto);
    }

    @Delete(':board_id/cards/:id')
    deleteCard(@Param('board_id') board_id: string, @Param('id') card_id: string) {
        console.log('удаление карты');
        return this.cardsService.deleteCard(board_id, card_id);
    }
}
