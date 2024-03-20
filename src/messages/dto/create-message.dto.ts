export class CreateMessageDto {
    readonly message_value: string;
    readonly message_type: string;
    readonly messenger_type?: string;
    readonly messenger_id?: string;
    readonly contact_id?: string;
    readonly manager_id?: string;
    readonly chat_id: string;
}
