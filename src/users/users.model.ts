import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface UserCreationAttrs {
    user_id: string;
    user_name: string;
    user_email: string;
    user_password: string;
    user_role: string;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs> {
    @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
    @Column({ type: DataType.STRING, unique: true, primaryKey: true })
    user_id: string;

    @ApiProperty({ example: 'Иван', description: 'Имя пользователя' })
    @Column({ type: DataType.STRING, allowNull: false })
    user_name: string;

    @ApiProperty({ example: 'user@mail.ru', description: 'Адрес электронной почты' })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    user_email: string;

    @ApiProperty({ example: '1234567abc', description: 'Пароль' })
    @Column({ type: DataType.STRING, allowNull: false })
    user_password: string;

    @ApiProperty({ example: '+79999999999', description: 'Телефон' })
    @Column({ type: DataType.STRING, unique: true, allowNull: true })
    user_phone: string;

    @ApiProperty({ example: 'admin', description: 'Роль пользователя' })
    @Column({ type: DataType.STRING, allowNull: false })
    user_role: string;

    @ApiProperty({ example: 'online', description: 'статус пользователя' })
    @Column({ type: DataType.STRING, allowNull: true, defaultValue: 'online' })
    user_status: string;

    @ApiProperty({ example: 'path/img.jpg', description: 'URL путь к фото пользователя' })
    @Column({ type: DataType.STRING, allowNull: true })
    user_photo_url: string;

    @ApiProperty({ example: 'Главный менеджер', description: 'Описание пользователя' })
    @Column({ type: DataType.STRING, allowNull: true, defaultValue: '' })
    user_about: string;

    @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true })
    user_shortcuts: string[];
}
