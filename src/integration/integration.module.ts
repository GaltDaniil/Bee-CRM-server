import { Module } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contact } from 'src/contacts/contacts.model';
import { CardsModule } from 'src/cards/cards.module';
import { ContactsModule } from 'src/contacts/contacts.module';

@Module({
    providers: [IntegrationService],
    controllers: [IntegrationController],
    imports: [SequelizeModule.forFeature([Contact]), ContactsModule, CardsModule],
})
export class IntegrationModule {}
