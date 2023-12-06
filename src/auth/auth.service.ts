import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { IFrontendUserDto, LoginUserDto, UserTokenDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        //private accountService: AccountsService,
        private jwtService: JwtService,
    ) {}

    private async validateUser(dto: LoginUserDto) {
        const user = await this.userService.getUserByEmail(dto.user_email);
        if (!user) {
            throw new UnauthorizedException({ message: 'Не корректный логин или пароль' });
        }
        const passwordEquals = await bcrypt.compare(dto.user_password, user.user_password);

        if (!passwordEquals) {
            throw new UnauthorizedException({ message: 'Не корректный логин или пароль' });
        }
        return user;
    }

    private async generateToken(user: IFrontendUserDto) {
        return {
            token: this.jwtService.sign(user),
        };
    }

    async login(dto: LoginUserDto) {
        try {
            const candidate = await this.validateUser(dto);

            const user = {
                user_id: candidate.user_id,
                user_role: [candidate.user_role],
                from: '',
                data: {
                    user_name: candidate.user_name,
                    user_photo_url: candidate.user_photo_url,
                    user_email: candidate.user_email,
                    user_shortcuts: candidate.user_shortcuts || [],
                },
            };
            const { token } = await this.generateToken(user);
            return { user, access_token: token };
        } catch (error) {
            return {
                error: [
                    {
                        type: 'email',
                        message: error.message,
                    },
                    {
                        type: 'password',
                        message: error.message,
                    },
                ],
            };
        }
    }

    async checkToken(dto: UserTokenDto) {
        try {
            const decodedToken = this.jwtService.verify(dto.access_token);
            if (!decodedToken) {
                throw new HttpException('Истек срок действия токена', HttpStatus.BAD_REQUEST);
            }
            return { user: decodedToken, access_token: dto.access_token };
        } catch (error) {
            console.log('ошибка при проверки токена', error);
            return {
                error: [
                    {
                        type: 'email',
                        message: error.message,
                    },
                    {
                        type: 'password',
                        message: error.message,
                    },
                ],
            };
        }
    }

    async registration(dto: CreateUserDto) {
        try {
            const candidate = await this.userService.getUserByEmail(dto.user_email);
            if (candidate) {
                throw new HttpException(
                    'Пользователь с таким email уже существует',
                    HttpStatus.BAD_REQUEST,
                );
            }
            const hashPassword = await bcrypt.hash(dto.user_password, 10);
            const newUser = await this.userService.createUser({
                ...dto,
                user_password: hashPassword,
            });
            const user = {
                user_id: newUser.user_id,
                user_role: [newUser.user_role],
                from: '',
                data: {
                    user_name: newUser.user_name,
                    user_photo_url: newUser.user_photo_url,
                    user_email: newUser.user_email,
                    user_shortcuts: newUser.user_shortcuts || [],
                },
            };
            const { token } = await this.generateToken(user);
            return { user, access_token: token };
        } catch (error) {
            return {
                error: [
                    {
                        type: 'email',
                        message: error.message,
                    },
                ],
            };
        }
    }
}
