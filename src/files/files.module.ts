import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { CardsModule } from 'src/cards/cards.module';

@Module({
    providers: [FilesService],
    exports: [FilesService],
    imports: [CardsModule],
    controllers: [FilesController],
})
export class FilesModule {}
