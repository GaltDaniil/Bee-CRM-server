import { Module } from '@nestjs/common';
import { ChatsModule } from 'src/chats/chats.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { FilesModule } from 'src/files/files.module';
import { EventModule } from 'src/event/event.module';
import { AttachmentsModule } from 'src/attachments/attachments.module';
import { MessagesModule } from 'src/messages/messages.module';
import { NovofonService } from './novofon.service';
import { NovofonController } from './novofon.controller';

@Module({
    exports: [NovofonService],
    providers: [NovofonService],
    controllers: [NovofonController],
    imports: [],
})
export class NovofonModule {}
