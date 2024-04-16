import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { Contact } from './contacts.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { Card } from 'src/cards/cards.model';

@Module({
    controllers: [ContactsController],
    providers: [ContactsService],
    imports: [SequelizeModule.forFeature([Contact])],
    exports: [ContactsService],
})
export class ContactsModule {}
