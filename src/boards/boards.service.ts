import { Injectable, NotFoundException } from '@nestjs/common';
import { Board } from './boards.model';
import { InjectModel } from '@nestjs/sequelize';
import { nanoid } from 'nanoid';
import { List } from 'src/lists/lists.model';
import { Card } from 'src/cards/cards.model';

@Injectable()
export class BoardsService {
    constructor(
        @InjectModel(Board) private boardRepository: typeof Board,
        @InjectModel(List) private listRepository: typeof List,
    ) {}

    async createBoard(dto) {
        try {
            dto.board_id = nanoid();

            const board = await this.boardRepository.create({
                ...dto,
                board_id: dto.board_id,
                board_lists: [{ list_id: '', list_cards: [] }],
            });
            console.log(board);
            return board;
        } catch (error) {
            console.log(error);
            console.log('Ошибка при создании Доски');
        }
    }

    async getBoard2(id) {
        try {
            const board = await this.boardRepository.findOne({
                where: {
                    board_id: id,
                },
                include: [List],
            });
            return board;
        } catch (error) {
            console.log(error);
            console.log(`Ошибка при получении Доски с id ${id}`);
        }
    }

    async getBoard(board_id) {
        try {
            const board = await this.boardRepository.findOne({ where: { board_id } });
            console.log('при запросе одной доски', board.board_lists[0].list_cards);
            return board;
        } catch (error) {
            console.log(error);
            console.log(`Ошибка при получении Доски с id ${board_id}`);
        }
    }

    async getBoardWithListsAndCards(board_id) {
        try {
            const board = await this.boardRepository.findByPk(board_id, {
                include: [
                    {
                        model: List, // Укажите модель List для включения
                        as: 'board_lists', // Укажите ассоциацию для включения
                        include: [
                            {
                                model: Card, // Укажите модель Card для включения
                                as: 'list_cards', // Укажите ассоциацию для включения
                            },
                        ],
                    },
                ],
            });
            return board;
        } catch (error) {
            console.log(error);
            console.log(`Ошибка при получении Доски с id ${board_id}`);
        }
    }

    async getBoards() {
        try {
            const boards = await this.boardRepository.findAll();
            return boards;
        } catch (error) {
            console.log(error);
            console.log('Ошибка при получении списка Досок');
        }
    }

    async updateBoard(id, dto) {
        try {
            console.log('dto', dto);
            if (dto.title) {
                dto.board_title = dto.title;
            }
            const [updatedRowsCount, updatedBoards] = await this.boardRepository.update(dto, {
                where: {
                    board_id: id,
                },
                returning: true,
            });
            if (updatedRowsCount === 0) {
                throw new NotFoundException(`Доска с id ${id} не найдена при обновлении`);
            }
            console.log(updatedBoards);
            return updatedBoards[0];
        } catch (error) {
            console.log(error);
            console.log('Ошибка при обновлении Доски');
        }
    }

    async deleteBoard(id) {
        try {
            this.boardRepository.destroy({ where: { board_id: id } });
        } catch (error) {
            console.log(error);
            console.log('Ошибка при удалении Доски');
        }
    }
}
