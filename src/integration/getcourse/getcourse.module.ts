import { Module } from '@nestjs/common';
import { ContactsModule } from 'src/contacts/contacts.module';
import { GetcourseService } from './getcourse.service';
import { GetcourseController } from './getcourse.controller';
import { CardsModule } from 'src/cards/cards.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contact } from 'src/contacts/contacts.model';

@Module({
    exports: [GetcourseService],
    providers: [GetcourseService],
    controllers: [GetcourseController],
    imports: [ContactsModule, CardsModule],
})
export class GetcourseModule {}
