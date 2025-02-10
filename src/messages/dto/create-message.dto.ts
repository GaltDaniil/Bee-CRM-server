import { Attachment } from 'src/attachments/attachments.model';

export class MessengerAttachments {
    files: [];
    files_type: string;
}

export class CreateMessageDto {
    readonly contact_email?: string;
    readonly contact_name?: string;
    readonly contact_phone?: string;
    readonly contact_getcourse_link?: string;
    readonly chat_id: string;
    readonly message_value: string;
    readonly message_type: string;
    readonly messenger_type?: string;
    readonly messenger_id?: string;
    readonly contact_id?: string;
    readonly manager_id?: string;
    readonly message_from?: string;
    readonly attachments?: MessengerAttachments;
}
