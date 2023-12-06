import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginUserDto, UserTokenDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('sign-in')
    login(@Body() dto: LoginUserDto) {
        return this.authService.login(dto);
    }

    @Post('access-token')
    accessToken(@Body() dto: UserTokenDto) {
        return this.authService.checkToken(dto);
    }

    @Post('sign-up')
    registration(@Body() dto: CreateUserDto) {
        return this.authService.registration(dto);
    }
}
