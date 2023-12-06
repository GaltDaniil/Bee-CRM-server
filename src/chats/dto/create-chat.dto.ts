export class CreateChatDto {
    readonly contact_id: string;
    readonly messenger_id: string;
    readonly messenger_type: string;
    readonly from_url?: string;
}
