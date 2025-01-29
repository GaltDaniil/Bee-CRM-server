import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { CreateListDto, UpdateListDto } from './dto/list.dto';
import { ListsService } from './lists.service';

@Controller('scrumboard/boards')
export class ListsController {
    constructor(private listsService: ListsService) {}

    @Get(':board_id/lists/:list_id')
    getBoard(@Param('board_id') board_id: string, @Param('list_id') list_id: string) {
        return this.listsService.getList({ board_id, list_id });
    }

    @Post(':board_id/lists/')
    createBoard(@Param('board_id') boardId: string, @Body() dto: CreateListDto) {
        return this.listsService.createList(boardId, dto);
    }

    @Get(':board_id/lists/')
    getBoards(@Param('board_id') board_id: string) {
        return this.listsService.getLists(board_id);
    }

    @Put(':id/lists')
    updateBoard(@Param('id') id: string, @Body() dto: UpdateListDto) {
        return this.listsService.updateList(id, dto);
    }

    @Delete(':board_id/lists/:list_id')
    deleteBoard(@Param('board_id') board_id: string, @Param('list_id') list_id: string) {
        return this.listsService.deleteList(list_id);
    }
}
