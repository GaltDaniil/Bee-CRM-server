import { Body, Controller, Get, Param, Post, UseGuards, UsePipes } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from './users.model';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guards';
import { ValidationPipe } from 'src/pipes/validation-pipe';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @ApiOperation({ summary: 'Создание пользователя' })
    @ApiResponse({ status: 200, type: User })
    //@UsePipes(ValidationPipe)
    @Post()
    create(@Body() userDto: CreateUserDto) {
        return this.usersService.createUser(userDto);
    }

    @ApiOperation({ summary: 'Получить всех пользователей' })
    @ApiResponse({ status: 200, type: [User] })
    @UseGuards(JWTAuthGuard)
    @Get()
    getAll() {
        return this.usersService.getAllUsers();
    }

    @Get(':id')
    getUserByIdDemo(@Param('id') id: string) {
        return this.usersService.getUserById(id);
    }
}
