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
import { Board } from 'src/boards/boards.model';
import { Comment } from 'src/comments/comments.model';
import { Contact } from 'src/contacts/contacts.model';
import { List } from 'src/lists/lists.model';

interface CardCreationAttrs {
    card_id: string;
    board_id: string;
    list_id: string;
    contact_id: string;
    card_deal_num?: string;
    card_deal_title?: string;
    card_deal_description?: string;
    card_deal_price?: string;
    card_deal_left_cost?: string;
    card_deal_payed_money?: string;
    card_deal_status?: string;
    card_deal_pay_url?: string;
    card_deal_url?: string;
    card_client_url?: string;
    card_deal_manager?: string;
    card_deal_manager_email?: string;
    card_utm_source?: string;
    card_utm_medium?: string;
    card_utm_campaign?: string;
    card_utm_content?: string;
    card_utm_term?: string;
    card_deal_created?: string;
    card_deal_payed?: string;
}

@Table({ tableName: 'cards' })
export class Card extends Model<Card, CardCreationAttrs> {
    @Column({ type: DataType.STRING, unique: true, primaryKey: true })
    card_id: string;

    @ForeignKey(() => List)
    @Column({ type: DataType.STRING, allowNull: false })
    list_id: string;

    @ForeignKey(() => Board)
    @Column({ type: DataType.STRING, allowNull: false })
    board_id: string;

    @ForeignKey(() => Contact)
    @Column({ type: DataType.STRING, allowNull: true })
    contact_id: string;

    // СИСТЕМНЫЕ

    @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true, defaultValue: [] })
    card_labels: string[];

    @Column({ type: DataType.DATE, allowNull: true })
    dueDate: Date;

    @Column({ type: DataType.STRING, allowNull: true, defaultValue: '' })
    card_attachmentCoverId: string;

    @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true, defaultValue: [] })
    memberIds: string[];

    @Column({ type: DataType.BOOLEAN, allowNull: true, defaultValue: false })
    card_subscribed: boolean;

    @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true, defaultValue: [] })
    card_checklists: string[];

    /* @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true, defaultValue: [] })
    card_activities: string[]; */

    // Данные карточки с Геткурса

    @Column({ type: DataType.STRING, allowNull: true })
    card_deal_num: string;

    @Column({ type: DataType.STRING, allowNull: true })
    card_deal_status: string;

    @Column({ type: DataType.STRING, allowNull: true })
    card_deal_title: string;

    @Column({ type: DataType.STRING, allowNull: true, defaultValue: ' ' })
    card_deal_description: string;

    @Column({ type: DataType.STRING, allowNull: true, defaultValue: 0 })
    card_deal_price: string;

    @Column({ type: DataType.STRING, allowNull: true })
    card_deal_left_cost: string;

    @Column({ type: DataType.STRING, allowNull: true })
    card_deal_payed_money: string;

    @Column({ type: DataType.STRING, allowNull: true })
    card_deal_manager: string;

    @Column({ type: DataType.STRING, allowNull: true })
    card_deal_manager_email: string;

    @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true, defaultValue: [] })
    card_deal_offers: string[];

    //URL ссылки

    @Column({ type: DataType.STRING, allowNull: true })
    card_deal_pay_url: string;

    @Column({ type: DataType.STRING, allowNull: true })
    card_deal_url: string;

    @Column({ type: DataType.STRING, allowNull: true })
    card_client_url: string;

    // UTM Метки

    @Column({ type: DataType.STRING, allowNull: true })
    card_utm_source: string;

    @Column({ type: DataType.STRING, allowNull: true })
    card_utm_medium: string;

    @Column({ type: DataType.STRING, allowNull: true })
    card_utm_campaign: string;

    @Column({ type: DataType.STRING, allowNull: true })
    card_utm_content: string;

    @Column({ type: DataType.STRING, allowNull: true })
    card_utm_term: string;

    @Column({ type: DataType.STRING, allowNull: true })
    card_deal_created: string;

    @Column({ type: DataType.STRING, allowNull: true })
    card_deal_payed: string;

    @BelongsTo(() => List)
    list: List;

    @BelongsTo(() => Contact)
    contact: Contact;

    @HasMany(() => Attachment, { onDelete: 'cascade' })
    attachments: Attachment[];

    @HasMany(() => Comment, { onDelete: 'cascade' })
    activities: Comment[];
}
