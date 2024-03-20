export class CreateCommentDto {
    comment_id: string;
    readonly user_id: string;
    readonly comment_message: string;
}
