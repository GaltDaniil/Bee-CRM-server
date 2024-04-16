import { CardsService } from './cards.service';
import { Body, Controller, Delete, Get, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { CreateCardDto, UpdateCardDto, UpdateCardStatusDto } from './dto/card.dto';

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

    @Put(':board_id/cards/:id/')
    updateCard(@Param('id') id: string, @Body() dto: UpdateCardStatusDto) {
        return this.cardsService.updateCardInfo(dto);
    }

    @Put(':board_id/cards/:id/status')
    updateCardStatus(@Param('id') id: string, @Body() dto: UpdateCardStatusDto) {
        return this.cardsService.updateCardStatusFromBee(id, dto);
    }

    @Delete(':board_id/cards/:id')
    deleteCard(@Param('id') id: string) {
        console.log('удаление карты');
        return this.cardsService.deleteCard(id);
    }
}
