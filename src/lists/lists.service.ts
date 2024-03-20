import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListDto, UpdateListDto } from './dto/list.dto';
import { List } from './lists.model';
import { InjectModel } from '@nestjs/sequelize';
import { nanoid } from 'nanoid';
import { Card } from 'src/cards/cards.model';
import { Board } from 'src/boards/boards.model';

@Injectable()
export class ListsService {
    constructor(
        @InjectModel(List) private listRepository: typeof List,
        @InjectModel(Board) private boardRepository: typeof Board,
    ) {}

    async createList(boardId: string, dto: CreateListDto) {
        try {
            dto.list_id = nanoid();
            dto.board_id = boardId;
            const list = await this.listRepository.create(dto);
            const board = await this.boardRepository.findOne({ where: { board_id: boardId } });

            if (board) {
                // Обновление поля board_lists, добавление нового объекта
                const updatedBoardLists = [
                    ...board.board_lists,
                    { list_id: list.list_id, list_cards: [] },
                ];
                await board.update({ board_lists: updatedBoardLists });
            }
            return list;
        } catch (error) {
            console.log(error);
            console.log('Ошибка при создании Листа');
        }
    }

    async getList(id) {
        try {
            const list = await this.listRepository.findOne({
                where: {
                    list_id: id,
                },
                include: [Card],
            });
            return list;
        } catch (error) {
            console.log(error);
            console.log(`Ошибка при получении Листа с id ${id}`);
        }
    }

    async getLists(board_id) {
        try {
            const lists = await this.listRepository.findAll({ where: { board_id: board_id } });
            return lists;
        } catch (error) {
            console.log(error);
            console.log('Ошибка при получении списка Листов');
        }
    }

    async updateList(id, dto: UpdateListDto) {
        try {
            const [updatedRowsCount, updatedChats] = await this.listRepository.update(dto, {
                where: {
                    list_id: id,
                },
                returning: true,
            });
            if (updatedRowsCount === 0) {
                throw new NotFoundException(`Доска с id ${id} не найдена`);
            }
            return updatedChats;
        } catch (error) {
            console.log(error);
            console.log('Ошибка при обновлении Листа');
        }
    }

    async deleteList(id) {
        try {
            this.listRepository.destroy({ where: { list_id: id } });
        } catch (error) {
            console.log(error);
            console.log('Ошибка при удалении Листа');
        }
    }
}
