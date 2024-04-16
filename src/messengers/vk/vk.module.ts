import { Module } from '@nestjs/common';
import { VkService } from './vk.service';
import { ChatsModule } from 'src/chats/chats.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { FilesModule } from 'src/files/files.module';
import { EventModule } from 'src/event/event.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Message } from 'src/messages/messages.model';
import { AttachmentsModule } from 'src/attachments/attachments.module';

@Module({
    exports: [VkService],
    providers: [VkService],
    imports: [
        SequelizeModule.forFeature([Message]),
        ChatsModule,
        ContactsModule,
        FilesModule,
        EventModule,
        AttachmentsModule,
    ],
})
export class VkModule {}
