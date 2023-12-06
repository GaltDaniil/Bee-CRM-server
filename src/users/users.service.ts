import { Injectable } from '@nestjs/common';
import { User } from './users.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdef123456789', 24);

@Injectable()
export class UsersService {
    constructor(@InjectModel(User) private userRepository: typeof User) {}

    async createUser(dto: CreateUserDto) {
        //@ts-ignore
        const id = nanoid(24);
        const user = await this.userRepository.create({
            ...dto,
            user_id: id,
            user_role: 'admin',
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
        return users;
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
