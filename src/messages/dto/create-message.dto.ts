export class CreateMessageDto {
    readonly chat_id: string;
    readonly message_value: string;
    readonly message_type: string;
    readonly messenger_type?: string;
    readonly messenger_id?: string;
    readonly contact_id?: string;
    readonly manager_id?: string;
}
