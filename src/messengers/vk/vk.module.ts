import { forwardRef, Module } from '@nestjs/common';
import { VkService } from './vk.service';
import { ChatsModule } from 'src/chats/chats.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { FilesModule } from 'src/files/files.module';
import { EventModule } from 'src/event/event.module';
import { MessagesModule } from 'src/messages/messages.module';
import { AttachmentsModule } from 'src/attachments/attachments.module';

@Module({
    exports: [VkService],
    providers: [VkService],
    imports: [
        ChatsModule,
        ContactsModule,
        FilesModule,
        EventModule,
        forwardRef(() => MessagesModule),
        forwardRef(() => AttachmentsModule),
    ],
})
export class VkModule {}
