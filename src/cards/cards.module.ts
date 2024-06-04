import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Card } from './cards.model';
import { Board } from 'src/boards/boards.model';
import { EventGateway } from 'src/event/event.gateway';
import { EventModule } from 'src/event/event.module';
import { Contact } from 'src/contacts/contacts.model';
import { User } from 'src/users/users.model';
import { Chat } from 'src/chats/chats.model';

@Module({
    controllers: [CardsController],
    imports: [SequelizeModule.forFeature([Card, Board, Contact, User, Chat]), EventModule],
    providers: [CardsService],
    exports: [CardsService],
})
export class CardsModule {}
