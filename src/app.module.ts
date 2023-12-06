import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ConfigModule } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { ContactsModule } from './contacts/contacts.module';
import { ChatsModule } from './chats/chats.module';

import { User } from './users/users.model';
import { Chat } from './chats/chats.model';
import { Contact } from './contacts/contacts.model';
import { MessagesModule } from './messages/messages.module';
import { Message } from './messages/messages.model';
import { AuthModule } from './auth/auth.module';
import { MessengersModule } from './messengers/messengers.module';
import { TelegramModule } from './messengers/telegram/telegram.module';
import { FilesModule } from './files/files.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({ envFilePath: '.env' }),
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            models: [User, Chat, Contact, Message],
            autoLoadModels: true,
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'static'), // Путь к корневой папке static
            serveRoot: '/static', // URL-префикс для обслуживания статических файлов
        }),
        ChatsModule,
        UsersModule,
        AccountsModule,
        ContactsModule,
        MessagesModule,
        AuthModule,
        MessengersModule,
        FilesModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
