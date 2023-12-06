import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AccountsModule } from 'src/accounts/accounts.module';
import * as dotenv from 'dotenv';

dotenv.config();

const secret = process.env.SECRET_JWT;

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        forwardRef(() => UsersModule),
        AccountsModule,
        JwtModule.register({ secret: secret, signOptions: { expiresIn: '24h' } }),
    ],
    exports: [AuthService, JwtModule],
})
export class AuthModule {}
