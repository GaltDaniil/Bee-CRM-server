import {
    Column,
    DataType,
    Table,
    Model,
    HasMany,
    BelongsTo,
    ForeignKey,
} from 'sequelize-typescript';
import { Board } from 'src/boards/boards.model';
import { Card } from 'src/cards/cards.model';

interface ListCreationAttrs {
    list_id: string;
    board_id: string;
    list_title: string;
}

@Table({ tableName: 'lists' })
export class List extends Model<List, ListCreationAttrs> {
    @Column({ type: DataType.STRING, unique: true, primaryKey: true })
    list_id: string;

    @ForeignKey(() => Board)
    @Column({ type: DataType.STRING, allowNull: true })
    board_id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    list_title: string;

    /* @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true })
    list_cards: string[]; */

    /* @BelongsTo(() => Board)
    board: Board; */

    @HasMany(() => Card, { onDelete: 'cascade' })
    list_cards: Card[];
}
