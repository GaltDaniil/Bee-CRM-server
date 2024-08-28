import { Module, forwardRef } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { Chat } from './chats.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contact } from 'src/contacts/contacts.model';
import { Message } from 'src/messages/messages.model';
import { UsersModule } from 'src/users/users.module';
import { TelegramModule } from 'src/messengers/telegram/telegram.module';
import { Card } from 'src/cards/cards.model';

@Module({
    controllers: [ChatsController],
    providers: [ChatsService],
    imports: [SequelizeModule.forFeature([Chat, Contact, Message, Card]), UsersModule],
    exports: [ChatsService],
})
export class ChatsModule {}
