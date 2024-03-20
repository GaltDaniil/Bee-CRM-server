import { Module, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ChatsModule } from 'src/chats/chats.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { FilesModule } from 'src/files/files.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Message } from 'src/messages/messages.model';
import { EventModule } from 'src/event/event.module';

@Module({
    exports: [TelegramService],
    providers: [TelegramService],
    imports: [
        SequelizeModule.forFeature([Message]),
        ChatsModule,
        ContactsModule,
        FilesModule,
        EventModule,
    ],
})
export class TelegramModule {}
