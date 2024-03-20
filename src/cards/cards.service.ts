import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { nanoid } from 'nanoid';
import { CreateCardDto, UpdateCardDto, UpdateCardStatusDto } from './dto/card.dto';
import { Board } from 'src/boards/boards.model';
import { Card } from './cards.model';
import { EventGateway } from 'src/event/event.gateway';
import { Contact } from 'src/contacts/contacts.model';
import { User } from 'src/users/users.model';

@Injectable()
export class CardsService {
    constructor(
        @InjectModel(Card) private cardRepository: typeof Card,
        @InjectModel(Board) private boardRepository: typeof Board,
        @InjectModel(Contact) private contactRepository: typeof Contact,
        @InjectModel(User) private userRepository: typeof User,
        private EventGateway: EventGateway,
    ) {}

    async createCard(boardId, dto: CreateCardDto) {
        try {
            dto.card_id = nanoid();
            dto.board_id = 'QSZj8tM1PRsfs-DBZq3Ph';
            dto.list_id = this.convertStatusToListId(dto.card_deal_status);

            if (dto.card_deal_manager_email) {
                const user = await this.userRepository.findOne({
                    where: {
                        user_email: dto.card_deal_manager_email,
                    },
                });
                if (user) {
                    dto.memberIds.push(user.user_id);
                }
            }

            const card = await this.cardRepository.create(dto);
            const board = await this.boardRepository.findByPk(boardId);

            if (board) {
                const updatedList = board.board_lists.map((el) => {
                    if (el.list_id === dto.list_id) {
                        el.list_cards = [card.card_id, ...el.list_cards];
                    }
                    return el;
                });
                await this.boardRepository.update(
                    { board_lists: updatedList },
                    {
                        where: { board_id: boardId },
                    },
                );
            }
            this.EventGateway.ioServer.emit('updateBoard');
            return card;
        } catch (error) {
            console.log(error);
            console.log('Ошибка при создании Карточки');
        }
    }

    async getCard(id) {
        try {
            const card = await this.cardRepository.findOne({
                where: {
                    card_id: id,
                },
            });
            return card;
        } catch (error) {
            console.log(error);
            console.log(`Ошибка при получении Карточки с id ${id}`);
        }
    }

    async getCardByNum(num) {
        try {
            const card = await this.cardRepository.findOne({
                where: {
                    card_deal_num: num,
                },
            });
            return card;
        } catch (error) {
            console.log(error);
            console.log(`Ошибка при получении Карточки с num ${num}`);
        }
    }

    async getCards(board_id) {
        try {
            const cards = await this.cardRepository.findAll({ where: { board_id } });
            return cards;
        } catch (error) {
            console.log(error);
            console.log('Ошибка при получении списка Карточек');
        }
    }

    async updateCardInfo(dto: UpdateCardDto) {
        try {
            const [updatedRowsCount, updatedCards] = await this.cardRepository.update(dto, {
                where: {
                    card_id: dto.card_id,
                },
                returning: true,
            });

            const contact = await this.contactRepository.findByPk(updatedCards[0].contact_id);

            if (updatedRowsCount === 0) {
                throw new NotFoundException(`Карточа с id ${dto.card_id} не найдена`);
            }

            this.changeStatusInGc(updatedCards[0], contact);
            this.EventGateway.ioServer.emit('updateBoard');
            return updatedCards[0];
        } catch (error) {
            console.log(error);
            console.log('Ошибка при обновлении Карточки');
        }
    }
    async updateCardStatusFromBee(card_id, dto: UpdateCardStatusDto) {
        try {
            dto.card_deal_status = this.convertListIdToStatus(dto.list_id);
            const card = await this.cardRepository.findOne({
                where: {
                    card_id: card_id,
                },
            });

            if (dto.card_deal_manager_email) {
                dto.memberIds = [dto.card_deal_manager_email];
            }

            const contact = await this.contactRepository.findByPk(card.contact_id);

            const [updatedRowsCount, updatedCards] = await this.cardRepository.update(dto, {
                where: {
                    card_id,
                },
                returning: true,
            });
            if (updatedRowsCount === 0) {
                throw new NotFoundException(`Карточа с id ${card_id} не найдена`);
            }
            this.EventGateway.ioServer.emit('updateBoard');

            this.changeStatusInGc(updatedCards[0], contact);

            return updatedCards;
        } catch (error) {
            console.log(error);
            console.log('Ошибка при обновлении Карточки');
        }
    }

    async updateCardStatusfromGetcourse(dto) {
        try {
            const { card_deal_num, card_deal_status } = dto;

            const card = await this.cardRepository.findOne({
                where: {
                    card_deal_num,
                },
            });

            if (!card) {
                throw new NotFoundException(`Карточа с num ${card_deal_num} не найдена`);
            }
            const oldList = card.list_id;

            if (card_deal_status === card.card_deal_status) {
                return;
            }
            dto.list_id = this.convertStatusToListId(dto.card_deal_status);

            await card.update(dto);

            const board = await this.boardRepository.findOne({
                where: {
                    board_id: 'QSZj8tM1PRsfs-DBZq3Ph',
                },
            });

            if (!board) {
                throw new NotFoundException(
                    `Карточа с deal_num ${dto.deal_num} не обновилась из за отсутствия доски`,
                );
            }
            const updatedBoardLists = board.board_lists.map((el) => {
                if (el.list_id === dto.list_id) {
                    el.list_cards.unshift(card.card_id);
                }
                if (el.list_id === oldList) {
                    el.list_cards = el.list_cards.filter((el) => el !== card.card_id);
                }
                return el;
            });
            await this.boardRepository.update(
                { board_lists: updatedBoardLists },
                {
                    where: {
                        board_id: 'QSZj8tM1PRsfs-DBZq3Ph',
                    },
                },
            );
            this.EventGateway.ioServer.emit('updateBoard');
            return card;
        } catch (error) {
            console.log(error);
            console.log('Ошибка при обновлении Карточки');
        }
    }

    async deleteCard(id) {
        try {
            const card = await this.cardRepository.findOne({ where: { card_id: id } });

            const board = await this.boardRepository.findOne({
                where: { board_id: 'QSZj8tM1PRsfs-DBZq3Ph' },
            });
            if (!board) {
                throw new NotFoundException(`Доска с id ${'QSZj8tM1PRsfs-DBZq3Ph'} не найдена`);
            }

            const readyLists = board.board_lists.map((el) => {
                if (el.list_id === card.list_id) {
                    el.list_cards = el.list_cards.filter((el) => el !== card.card_id);
                }
                return el;
            });

            await this.boardRepository.update(
                { board_lists: readyLists },
                {
                    where: {
                        board_id: 'QSZj8tM1PRsfs-DBZq3Ph',
                    },
                },
            );
            this.EventGateway.ioServer.emit('updateBoard');
            await this.cardRepository.destroy({ where: { card_id: id } });
        } catch (error) {
            console.log(error);
            console.log('Ошибка при удалении Карточки');
        }
    }
    private convertStatusToListId(status) {
        if (status === 'Новый') {
            return 'new';
        } else if (status === 'В работе') {
            return 'in_work';
        } else if (status === 'Завершен') {
            return 'payed';
        } else if (status === 'Отменен') {
            return 'cancelled';
        } else if (status === 'Ожидаем оплаты') {
            return 'payment_waiting';
        } else if (status === 'Не подтвержден') {
            return 'not_confirmed';
        } else if (status === 'Ложный') {
            return 'false';
        } else if (status === 'Отложен') {
            return 'pending';
        } else if (status === 'Частично оплачен') {
            return 'part_payed';
        } else if (status === 'Ожидаем возврата') {
            return 'waiting_for_return';
        } else {
            return 'what??';
        }
    }
    private convertListIdToStatus(list_id) {
        if (list_id === 'new') {
            return 'Новый';
        } else if (list_id === 'in_work') {
            return 'В работе';
        } else if (list_id === 'payed') {
            return 'Завершен';
        } else if (list_id === 'cancelled') {
            return 'Отменен';
        } else if (list_id === 'payment_waiting') {
            return 'Ожидаем оплаты';
        } else if (list_id === 'not_confirmed') {
            return 'Не подтвержден';
        } else if (list_id === 'false') {
            return 'Ложный';
        } else if (list_id === 'pending') {
            return 'Отложен';
        } else if (list_id === 'part_payed') {
            return 'Частично оплачен';
        } else if (list_id === 'waiting_for_return') {
            return 'Ожидаем возврата';
        } else {
            return 'what??';
        }
    }

    private changeStatusInGc(card, contact) {
        const data = {
            user: {
                email: contact.contact_email,
            },
            system: {
                refresh_if_exists: 1,
            },
            deal: {
                deal_number: card.card_deal_num,
                deal_cost: card.card_deal_price,
                deal_status: card.card_deal_status,
                product_title: card.card_deal_title,
                manager_email: card.card_deal_manager_email,
            },
        };

        const jsonData = JSON.stringify(data);
        const base64Data = Buffer.from(jsonData).toString('base64');

        const apiUrl = `https://linnik-fitness1.getcourse.ru/pl/api/deals`;

        const secret_key =
            'yvV24VmeuCCoG9ClBhNHcSLSbPrPAO6naFw84AAB6p5xrgLuVe1JSIYU7uvC1GQx69edITzqH9bpQWcJjgDRZJ0NUWgMK5pk5375rpHt3RQ7JcLVWmRBwVeZ0iSgqX1d';

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=add&key=${secret_key}&params=${encodeURIComponent(base64Data)}`,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
}
