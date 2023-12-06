import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface AccountsCreationAttrs {
    owner_id: string;
    account_title: string;
}

export interface AccountModel {
    account_id: string;
    account_title: string;
    account_about: string;
    owner_id: string;
}

@Table({ tableName: 'accounts' })
export class Account extends Model<Account, AccountsCreationAttrs> {
    @Column({ type: DataType.STRING, unique: true, primaryKey: true })
    account_id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    account_title: string;

    @Column({ type: DataType.STRING, allowNull: true })
    account_about: string;

    @Column({ type: DataType.STRING, allowNull: false })
    owner_id: string;
}
