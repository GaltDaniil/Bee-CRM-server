export class CreateContactDto {
    readonly contact_name: string;
    readonly contact_photo_url: string;
    readonly contact_phone?: string;
    readonly contact_email?: string;
    readonly contact_id?: string;
    readonly account_id?: string;
}
