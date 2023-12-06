export class CreateMessageDto {
    readonly message_value: string;
    readonly message_type: string;
    readonly contact_id?: string;
    readonly manager?: string;
    readonly chat_id: string;
}
