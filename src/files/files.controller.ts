import {
    Body,
    Controller,
    Param,
    Post,
    Query,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('scrumboard/boards')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    /* @Post(':board_id/cards/:card_id/addfiles')
    @UseInterceptors(FileInterceptor('file', { limits: { files: 1 } }))
    async uploadFiles(
        @UploadedFile() file,
        @Param('board_id') board_id: string,
        @Param('card_id') card_id: string,
    ) {
        return this.filesService.saveCardFiles(file, board_id, card_id);
    } */
}
