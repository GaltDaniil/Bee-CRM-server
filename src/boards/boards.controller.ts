import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';

@Controller('scrumboard/boards')
export class BoardsController {
    constructor(private boardsService: BoardsService) {}

    @Get()
    getBoards() {
        return this.boardsService.getBoards();
    }
    @Get(':id')
    getBoard(@Param('id') id: string) {
        return this.boardsService.getBoard(id);
    }

    @Get(':id/includes')
    getBoardWithListsAndCards(@Param('id') id: string) {
        return this.boardsService.getBoardWithListsAndCards(id);
    }

    @Post()
    createBoard(@Body() dto: CreateBoardDto) {
        return this.boardsService.createBoard(dto);
    }

    @Put(':id')
    updateBoard(@Param('id') id: string, @Body() dto: UpdateBoardDto) {
        return this.boardsService.updateBoard(id, dto);
    }

    @Delete(':id')
    deleteBoard(@Param('id') id: string) {
        return this.boardsService.deleteBoard(id);
    }
}
