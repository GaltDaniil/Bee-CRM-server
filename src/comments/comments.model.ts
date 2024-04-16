import {
    Column,
    DataType,
    Table,
    Model,
    HasMany,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { Card } from 'src/cards/cards.model';
import { List } from 'src/lists/lists.model';
import { User } from 'src/users/users.model';

interface CommentsCreationAttrs {
    comment_id: string;
    comment_type: string;
    user_id: string;
}

@Table({ tableName: 'comments' })
export class Comment extends Model<Comment, CommentsCreationAttrs> {
    @Column({ type: DataType.STRING, unique: true, primaryKey: true })
    comment_id: string;

    @ForeignKey(() => Card)
    @Column({ type: DataType.STRING, allowNull: false })
    card_id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    comment_type: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.STRING, allowNull: false })
    user_id: string;

    @Column({ type: DataType.STRING, allowNull: true })
    comment_message: string;

    @BelongsTo(() => Card)
    card: Card;
}
