import { Column, DataType, Table, Model, HasMany } from 'sequelize-typescript';
import { Chat } from 'src/chats/chats.model';

interface ContactCreationAttrs {
    account_id: string;
    contact_name: string;
    contact_photo_url: string;
}

@Table({ tableName: 'contacts' })
export class Contact extends Model<Contact, ContactCreationAttrs> {
    @Column({ type: DataType.STRING, unique: true, primaryKey: true })
    contact_id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    account_id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    contact_name: string;

    @Column({ type: DataType.STRING, allowNull: false })
    contact_photo_url: string;

    @Column({ type: DataType.STRING, allowNull: true })
    contact_email: string;

    @Column({ type: DataType.STRING, allowNull: true })
    contact_phone: string;

    @Column({ type: DataType.STRING, allowNull: true })
    contact_about: string;

    @Column({ type: DataType.STRING, allowNull: true })
    contact_address: string;

    @Column({ type: DataType.STRING, allowNull: true })
    contact_birthday: string;

    @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'online' })
    contact_status: string;

    @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true })
    contact_links: string[];

    @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true })
    contact_media: string[];

    @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true })
    contact_docs: string[];

    @HasMany(() => Chat, { onDelete: 'cascade' })
    chats: Chat[];
}
