import {
    Column,
    DataType,
    Table,
    Model,
    BelongsTo,
    ForeignKey,
    HasMany,
} from 'sequelize-typescript';
import { Attachment } from 'src/attachments/attachments.model';
import { Chat } from 'src/chats/chats.model';
import { Contact } from 'src/contacts/contacts.model';
import { User } from 'src/users/users.model';

interface MessageCreationAttrs {
    chat_id: string;
    contact_id: string;
    message_value: string;
    message_type: string;
}

@Table({ tableName: 'messages' })
export class Message extends Model<Message, MessageCreationAttrs> {
    @Column({ type: DataType.STRING, unique: true, primaryKey: true })
    message_id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    message_value: string;

    @Column({ type: DataType.STRING, allowNull: false })
    message_type: string;

    @Column({ type: DataType.STRING, allowNull: false })
    message_from: string;

    @ForeignKey(() => Contact)
    @Column({ type: DataType.STRING, allowNull: false })
    contact_id: string;

    @ForeignKey(() => Chat)
    @Column({ type: DataType.STRING, allowNull: false })
    chat_id: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.STRING, allowNull: true })
    manager_id: string;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
    is_readed: string;

    @HasMany(() => Attachment, { onDelete: 'CASCADE' }) // Каскадное удаление вложений
    attachments: Attachment[];

    @BelongsTo(() => Chat, { onDelete: 'CASCADE' }) // При удалении чата удалятся все сообщения
    chat: Chat;
}
