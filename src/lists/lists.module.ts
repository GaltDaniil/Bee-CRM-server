import { Module } from '@nestjs/common';
import { ListsService } from './lists.service';
import { ListsController } from './lists.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { List } from './lists.model';
import { Board } from 'src/boards/boards.model';

@Module({
    providers: [ListsService],
    imports: [SequelizeModule.forFeature([List, Board])],
    controllers: [ListsController],
    exports: [ListsService],
})
export class ListsModule {}
