import { Column, DataType, Table, Model, BelongsTo, ForeignKey } from 'sequelize-typescript';
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

    @BelongsTo(() => Chat)
    chat: Chat;
}
