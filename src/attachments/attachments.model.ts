import {
    Column,
    DataType,
    Table,
    Model,
    ForeignKey,
    BelongsTo,
    HasMany,
} from 'sequelize-typescript';
import { Card } from 'src/cards/cards.model';
import { Chat } from 'src/chats/chats.model';
import { Message } from 'src/messages/messages.model';

export interface AttachmentCreationAttrs {
    attachment_id: string;
    attachment_name: string;
    attachment_src: string;
    attachment_type: string;
    attachment_url: string;
    attachment_market?: object;
    card_id?: string;
    chat_id?: string;
    message_id?: string;
}

/* export interface BoardListsJSON {
    list_id: string;
    list_cards: any[];
} */

@Table({ tableName: 'attachments' })
export class Attachment extends Model<Attachment, AttachmentCreationAttrs> {
    @Column({ type: DataType.STRING, unique: true, primaryKey: true })
    attachment_id: string;

    @ForeignKey(() => Card)
    @Column({ type: DataType.STRING, allowNull: true })
    card_id: string;

    @ForeignKey(() => Chat)
    @Column({ type: DataType.STRING, allowNull: true })
    chat_id: string;

    @ForeignKey(() => Message)
    @Column({ type: DataType.STRING, allowNull: true })
    message_id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    attachment_name: string;

    @Column({ type: DataType.STRING, allowNull: true })
    attachment_src: string;

    @Column({ type: DataType.STRING, allowNull: true })
    attachment_type: string;

    @Column({ type: DataType.NUMBER, allowNull: true })
    attachment_size: number;

    @Column({ type: DataType.STRING, allowNull: true })
    attachment_extension: string;

    @Column({ type: DataType.JSONB, allowNull: true })
    attachment_payload: object;

    @Column({ type: DataType.STRING, allowNull: true, defaultValue: 'pending' }) // Статус загрузки файла
    attachment_status: string; // 'success', 'failed', 'pending'

    @BelongsTo(() => Card)
    card: Card;

    @BelongsTo(() => Chat)
    chat: Chat;

    @BelongsTo(() => Message, { onDelete: 'CASCADE' }) // При удалении сообщения удаляются все вложения
    message: Message;
}
