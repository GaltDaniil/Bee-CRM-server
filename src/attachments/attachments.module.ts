import { forwardRef, Module } from '@nestjs/common';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Attachment } from './attachments.model';
import { FilesModule } from 'src/files/files.module';
import { AttachmentsProvider } from './attachments.provider';
import { VkModule } from 'src/messengers/vk/vk.module';
import { TelegramModule } from 'src/messengers/telegram/telegram.module';

@Module({
    controllers: [AttachmentsController],
    imports: [
        SequelizeModule.forFeature([Attachment]),
        FilesModule,
        forwardRef(() => VkModule),

        forwardRef(() => TelegramModule),
    ],
    providers: [AttachmentsService, AttachmentsProvider],
    exports: [AttachmentsService],
})
export class AttachmentsModule {}
