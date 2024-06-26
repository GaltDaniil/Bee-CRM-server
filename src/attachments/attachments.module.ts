import { Module } from '@nestjs/common';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Attachment } from './attachments.model';
import { FilesModule } from 'src/files/files.module';

@Module({
    controllers: [AttachmentsController],
    imports: [SequelizeModule.forFeature([Attachment]), FilesModule],
    providers: [AttachmentsService],
    exports: [AttachmentsService],
})
export class AttachmentsModule {}
