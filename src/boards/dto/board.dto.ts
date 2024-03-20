import { List } from 'src/lists/lists.model';

export class CreateBoardDto {
    board_id: string;
    board_title: string;
    board_lists?: UpdateBoardDto[];
}

export class BoardLists {
    list_id: string;
    list_cards: string[];
}

export class UpdateBoardDto {
    board_lists: BoardLists[];
    board_title?: string;
}
