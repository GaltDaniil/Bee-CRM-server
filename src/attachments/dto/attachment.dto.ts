export class CreateAttachmentDto {
    attachment_id?: string;
    attachment_name?: string;
    attachment_type: string;
    attachment_src?: string;
    attachment_extension?: string;
    attachment_size?: number;
    attachment_payload?: AttachmentPayload;
    attachment_status?: string; // 'success', 'failed', 'pending'
    message_id?: string;
}

export type AttachmentPayload = {
    price?: string;
    title?: string;
    caption?: string;
    reply_message_id?: string;
    reply_text?: string;
    reply_from?: {
        id: string;
        first_name: string;
        username: string;
        is_bot: boolean;
    };
    description?: string;
    photo_url?: string;
    duration?: number;
    width?: number;
    height?: number;
};

export type MessengerAttachment = {
    file_id?: string;
    file_name?: string;
    file_extension?: string;
    file_type: string;
    file_size?: number;
    file_duration?: number;
    file_src?: string;
    payload?: AttachmentPayload;
};

export type MessengerAttachments = MessengerAttachment[];
