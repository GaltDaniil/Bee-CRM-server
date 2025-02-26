import { MessengerAttachment } from 'src/attachments/dto/attachment.dto';

export class CreateMessageDto {
    readonly contact_email?: string;
    readonly contact_name?: string;
    readonly contact_phone?: string;
    readonly contact_getcourse_link?: string;
    readonly chat_id: string;
    readonly message_value: string;
    readonly message_type: string;
    readonly message_from?: string;
    readonly messenger_type?: string;
    readonly messenger_id?: string;
    readonly contact_id?: string;
    readonly manager_id?: string;
    readonly attachments?: MessengerAttachment[];
}
