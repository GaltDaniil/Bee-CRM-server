import { Column, DataType, Table, Model, HasMany } from 'sequelize-typescript';
import { List } from 'src/lists/lists.model';

interface CommentsCreationAttrs {
    comment_id: string;
    comment_type: string;
    user_id: string;
}

@Table({ tableName: 'comments' })
export class Comment extends Model<Comment, CommentsCreationAttrs> {
    @Column({ type: DataType.STRING, unique: true, primaryKey: true })
    comment_id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    comment_type: string;

    @Column({ type: DataType.STRING, allowNull: false })
    user_id: string;

    @Column({ type: DataType.STRING, allowNull: true })
    comment_message: string;
}
