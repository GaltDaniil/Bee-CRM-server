import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'Иван', description: 'Имя пользователя' })
    @IsString({ message: 'Должно быть строкой' })
    readonly user_name: string;

    @ApiProperty({ example: 'user@mail.ru', description: 'Адрес электронной почты' })
    @IsString({ message: 'Должно быть строкой' })
    @IsEmail({}, { message: 'Не корректный email' })
    readonly user_email: string;

    @ApiProperty({ example: '123456abcd', description: 'Пароль' })
    @IsString({ message: 'Должно быть строкой' })
    @Length(4, 16, { message: 'Не меньше 4 и не больше 16 символов' })
    readonly user_password: string;
    /* @ApiProperty({ example: 'Admin', description: 'Роль пользователя' })
    readonly user_role: string; */
}
