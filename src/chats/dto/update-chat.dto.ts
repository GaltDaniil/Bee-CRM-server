export class UpdateChatDto {
    readonly chat_id?: string;
    readonly contact_id?: string;
    readonly chat_hidden?: boolean;
    readonly chat_muted?: boolean;
}
