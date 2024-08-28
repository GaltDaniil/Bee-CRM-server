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
import { FilesModule } from './files/files.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EventModule } from './event/event.module';
import { IntegrationModule } from './integration/integration.module';
import { BoardsModule } from './boards/boards.module';
import { CardsModule } from './cards/cards.module';
import { ListsModule } from './lists/lists.module';
import { CommentsModule } from './comments/comments.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { Card } from './cards/cards.model';
import { Attachment } from './attachments/attachments.model';
import { List } from './lists/lists.model';
import { Board } from './boards/boards.model';
import { Comment } from './comments/comments.model';
import { WaModule } from './messengers/wa/wa.module';

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
            models: [User, Chat, Contact, Message, Card, Attachment, List, Board, Comment],
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
        EventModule,
        IntegrationModule,
        BoardsModule,
        CardsModule,
        ListsModule,
        CommentsModule,
        AttachmentsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
