import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Board } from './boards.model';
import { List } from 'src/lists/lists.model';
import { ListsModule } from 'src/lists/lists.module';

@Module({
    controllers: [BoardsController],
    imports: [SequelizeModule.forFeature([Board]), ListsModule],
    providers: [BoardsService],
})
export class BoardsModule {}
