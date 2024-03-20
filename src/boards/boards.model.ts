import { json } from 'sequelize';
import { Column, DataType, Table, Model, HasMany } from 'sequelize-typescript';
import { List } from 'src/lists/lists.model';
import { BoardLists } from './dto/board.dto';

export interface BoardCreationAttrs {
    board_id: string;
    board_title: string;
    board_lists?: BoardLists[];
}

/* export interface BoardListsJSON {
    list_id: string;
    list_cards: any[];
} */

@Table({ tableName: 'boards' })
export class Board extends Model<Board, BoardCreationAttrs> {
    @Column({ type: DataType.STRING, unique: true, primaryKey: true })
    board_id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    board_title: string;

    @Column({ type: DataType.STRING, allowNull: true })
    board_description: string;

    @Column({ type: DataType.STRING, allowNull: true })
    board_icon: string;

    @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true })
    board_members: string[];

    @Column({ type: DataType.ARRAY(DataType.JSONB), allowNull: true, defaultValue: [] })
    board_lists: BoardLists[];

    @Column({ type: DataType.STRING, allowNull: true })
    lastActivity: string;

    @HasMany(() => List, { onDelete: 'cascade' })
    lists: List[];
}
