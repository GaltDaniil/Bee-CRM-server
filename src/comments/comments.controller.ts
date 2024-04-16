import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/comment.dto';

@Controller('scrumboard/boards/comments')
export class CommentsController {
    constructor(private commentsService: CommentsService) {}

    @Post('add')
    create(@Body() dto: CreateCommentDto) {
        return this.commentsService.createComment(dto);
    }

    @Get('all')
    getAll() {
        return this.commentsService.getAllComments();
    }
    @Get(':id')
    getOneContact(@Param('id') id: string) {
        return this.commentsService.getOneComment(id);
    }
}
