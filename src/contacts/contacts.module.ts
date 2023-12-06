import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { Contact } from './contacts.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
    controllers: [ContactsController],
    providers: [ContactsService],
    imports: [SequelizeModule.forFeature([Contact])],
    exports: [ContactsService],
})
export class ContactsModule {}
