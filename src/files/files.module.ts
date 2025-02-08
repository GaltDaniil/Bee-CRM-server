import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { CardsModule } from 'src/cards/cards.module';
import { TelegramProvider } from './providers/telegram.provider';
import { AttachmentsModule } from 'src/attachments/attachments.module';

@Module({
    providers: [FilesService, TelegramProvider],
    exports: [FilesService],
    imports: [CardsModule, AttachmentsModule],
    controllers: [FilesController],
})
export class FilesModule {}
