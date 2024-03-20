import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './users.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { customAlphabet } from 'nanoid';
import * as bcrypt from 'bcrypt';

const nanoid = customAlphabet('abcdef123456789', 24);

@Injectable()
export class UsersService {
    constructor(@InjectModel(User) private userRepository: typeof User) {}

    async createUser(dto: CreateUserDto) {
        const candidate = await this.userRepository.findOne({
            where: { user_email: dto.user_email },
        });
        if (candidate) {
            throw new HttpException(
                'Пользователь с таким email уже существует',
                HttpStatus.BAD_REQUEST,
            );
        }
        const hashPassword = await bcrypt.hash(dto.user_password, 10);
        //@ts-ignore
        const id = nanoid(24);
        const user = await this.userRepository.create({
            ...dto,
            user_id: id,
            user_password: hashPassword,
        });
        return user;
    }
    async createUserDemo(dto: CreateUserDto) {
        //@ts-ignore
        const id = nanoid();
        const user = await this.userRepository.create({ ...dto, user_id: id, user_role: 'admin' });
        return user;
    }
    async getAllUsers() {
        const users = await this.userRepository.findAll();
        return users.map((user) => ({
            user_id: user.user_id,
            user_role: [user.user_role],
            from: '',
            data: {
                user_name: user.user_name,
                user_photo_url: user.user_photo_url,
                user_email: user.user_email,
                user_shortcuts: user.user_shortcuts || [],
            },
        }));
    }

    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({
            where: { user_email: email },
            include: { all: true },
        });
        return user;
    }

    async getUserById(id: string) {
        const user = await this.userRepository.findOne({
            where: { user_id: id },
        });
        return user;
    }
}
