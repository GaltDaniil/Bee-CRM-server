export class CreateListDto {
    list_id: string;
    board_id: string;
    list_title: string;
}
export class UpdateListDto {
    readonly list_title: string;
}
