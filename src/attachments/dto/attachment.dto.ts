import { List } from 'src/lists/lists.model';

export class CreateAttachmentDto {
    attachment_id?: string;
    attachment_name: string;
    attachment_src: string;
    attachment_type: string;
    attachment_url: string;
    attachment_market?: object;
    attachment_extension?: string;
    attachment_replay?: object;
    card_id?: string;
    chat_id?: string;
    message_id?: string;
}
