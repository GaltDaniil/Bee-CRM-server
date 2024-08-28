import { Module } from '@nestjs/common';
import { WaService } from './wa.service';
import { ChatsModule } from 'src/chats/chats.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { FilesModule } from 'src/files/files.module';
import { EventModule } from 'src/event/event.module';
import { AttachmentsModule } from 'src/attachments/attachments.module';
import { MessagesModule } from 'src/messages/messages.module';
import { WaController } from './wa.controller';

@Module({
    exports: [WaService],
    providers: [WaService],
    controllers: [WaController],
    imports: [
        ChatsModule,
        ContactsModule,
        FilesModule,
        EventModule,
        AttachmentsModule,
        MessagesModule,
    ],
})
export class WaModule {}
