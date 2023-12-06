import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { Chat } from './chats.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contact } from 'src/contacts/contacts.model';
import { Message } from 'src/messages/messages.model';
import { User } from 'src/users/users.model';

@Module({
    controllers: [ChatsController],
    providers: [ChatsService],
    imports: [SequelizeModule.forFeature([Chat, Contact, Message, User])],
    exports: [ChatsService],
})
export class ChatsModule {}
