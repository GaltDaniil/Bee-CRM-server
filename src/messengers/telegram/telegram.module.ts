import { Module } from '@nestjs/common';

import { TelegramService } from './telegram.service';
import { ChatsModule } from 'src/chats/chats.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { MessagesModule } from 'src/messages/messages.module';
import { FilesModule } from 'src/files/files.module';

@Module({
    exports: [TelegramService],
    providers: [TelegramService],
    imports: [ChatsModule, ContactsModule, MessagesModule, FilesModule],
})
export class TelegramModule {}
