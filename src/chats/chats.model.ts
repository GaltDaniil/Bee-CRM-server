import {
    Column,
    DataType,
    Table,
    Model,
    BelongsTo,
    HasMany,
    ForeignKey,
} from 'sequelize-typescript';
import { Contact } from 'src/contacts/contacts.model';
import { Message } from 'src/messages/messages.model';

interface ChatCreationAttrs {
    contact_id: string;
    messenger_id: string;
    messenger_type: string;
}

@Table({ tableName: 'chats' })
export class Chat extends Model<Chat, ChatCreationAttrs> {
    @Column({ type: DataType.STRING, unique: true, primaryKey: true })
    chat_id: string;

    @ForeignKey(() => Contact)
    @Column({ type: DataType.STRING, allowNull: false })
    contact_id: string;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
    unread_count: number;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
    chat_muted: boolean;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
    chat_hidden: boolean;

    @Column({ type: DataType.STRING, allowNull: false })
    messenger_id: string;

    @Column({ type: DataType.STRING, allowNull: true })
    messenger_username: string;

    @Column({ type: DataType.STRING, allowNull: true })
    instagram_chat_id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    messenger_type: string;

    @Column({ type: DataType.STRING, allowNull: true })
    from_url: string; /* 

    @ForeignKey(() => Message)
    @Column({ type: DataType.STRING, allowNull: true })
    chat_last_message: string; */
    @BelongsTo(() => Contact)
    contact: Contact;

    @HasMany(() => Message, { onDelete: 'cascade' })
    messages: Message[];
}
