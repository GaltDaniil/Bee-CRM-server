import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Comment } from './comments.model';
import { CreateCommentDto } from './dto/comment.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class CommentsService {
    constructor(@InjectModel(Comment) private commentRepository: typeof Comment) {}

    async createСomment(dto: CreateCommentDto) {
        try {
            dto.comment_id = nanoid();
            const comment = await this.commentRepository.create(dto);
            return comment;
        } catch (error) {
            console.log(error);
            console.log('Ошибка при создании Комментария');
        }
    }

    async getСomment(id) {
        try {
            const comment = await this.commentRepository.findOne({
                where: {
                    comment_id: id,
                },
            });
            return comment;
        } catch (error) {
            console.log(error);
            console.log(`Ошибка при получении Комментария с id ${id}`);
        }
    }

    async getСomments() {
        try {
            const comments = await this.commentRepository.findAll();
            return comments;
        } catch (error) {
            console.log(error);
            console.log('Ошибка при получении списка Комментариев');
        }
    }

    async deleteСomment(id) {
        try {
            this.commentRepository.destroy({ where: { comment_id: id } });
        } catch (error) {
            console.log(error);
            console.log('Ошибка при удалении Комментария');
        }
    }
}
