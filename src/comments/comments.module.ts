import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './comments.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
    controllers: [CommentsController],
    imports: [SequelizeModule.forFeature([Comment])],
    providers: [CommentsService],
})
export class CommentsModule {}
