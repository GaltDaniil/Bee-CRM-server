import { Module } from '@nestjs/common';
import { ChatsModule } from 'src/chats/chats.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { FilesModule } from 'src/files/files.module';
import { EventModule } from 'src/event/event.module';
import { AttachmentsModule } from 'src/attachments/attachments.module';
import { MessagesModule } from 'src/messages/messages.module';
import { BothelpService } from './bothelp.service';
import { BothelpController } from './bothelp.controller';
import { CardsModule } from 'src/cards/cards.module';

@Module({
    exports: [BothelpService],
    providers: [BothelpService],
    controllers: [BothelpController],
    imports: [ContactsModule, CardsModule],
})
export class BothelpModule {}
