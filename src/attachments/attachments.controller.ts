import { Controller, Delete, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from 'src/files/files.service';
import { AttachmentsService } from './attachments.service';

@Controller('scrumboard/boards')
export class AttachmentsController {
    constructor(
        private filesService: FilesService,
        private attachmentsService: AttachmentsService,
    ) {}

    @Post(':board_id/cards/:card_id/attachments/add')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFiles(
        @UploadedFile() file,
        @Param('board_id') board_id: string,
        @Param('card_id') card_id: string,
    ) {
        console.log(file);
        console.log(board_id);
        console.log(card_id);
        const fileData = await this.filesService.saveCardAttachment(file);
        console.log('fileData', fileData);
        if (fileData) {
            const attachment = await this.attachmentsService.createAttachment(
                {
                    card_id,
                    attachment_name: fileData.fileOriginalName,
                    attachment_url: 'assets/card/attachments/' + fileData.fileName,
                    attachment_type: 'image',
                    attachment_src:
                        'https://beechat.ru/assets/card/attachments/' + fileData.fileName,
                    attachment_market: {},
                },
                fileData.filePath,
            );
            return attachment;
        }
    }

    @Delete(':board_id/cards/:card_id/attachments/delete/:attachment_id')
    async deleteAttachment(@Param('attachment_id') attachment_id: string) {
        return this.attachmentsService.deleteAttachment(attachment_id);
    }
}
