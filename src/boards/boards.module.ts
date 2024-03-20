import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Board } from './boards.model';
import { List } from 'src/lists/lists.model';

@Module({
    controllers: [BoardsController],
    imports: [SequelizeModule.forFeature([Board, List])],
    providers: [BoardsService],
})
export class BoardsModule {}
