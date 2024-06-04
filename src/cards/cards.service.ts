import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { nanoid } from 'nanoid';
import {
    CreateCardDto,
    CreateCardFromBeeDto,
    UpdateCardDto,
    UpdateCardStatusDto,
} from './dto/card.dto';
import { Board } from 'src/boards/boards.model';
import { Card } from './cards.model';
import { EventGateway } from 'src/event/event.gateway';
import { Contact } from 'src/contacts/contacts.model';
import { User } from 'src/users/users.model';
import { Attachment } from 'src/attachments/attachments.model';
import { Comment } from 'src/comments/comments.model';
import { Chat } from 'src/chats/chats.model';

import * as dotenv from 'dotenv';
dotenv.config();
const { GC_SECRET_KEY } = process.env;

@Injectable()
export class CardsService {
    constructor(
        @InjectModel(Card) private cardRepository: typeof Card,
        @InjectModel(Board) private boardRepository: typeof Board,
        @InjectModel(Contact) private contactRepository: typeof Contact,
        @InjectModel(User) private userRepository: typeof User,
        @InjectModel(Chat) private chatRepository: typeof Chat,
        private EventGateway: EventGateway,
    ) {}

    async createCardFromBh(dto: CreateCardDto) {
        try {
            dto.card_id = nanoid();
            const card = await this.cardRepository.create(dto);
            const board = await this.boardRepository.findByPk(dto.board_id);

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
                        where: { board_id: dto.board_id },
                    },
                );
            }
            this.EventGateway.ioServer.emit('updateBoard');
            return card;
        } catch (error) {
            console.log(error);
            console.log('Ошибка при создании Карточки из ботхелпа');
        }
    }

    async createCardFromGc(dto: CreateCardDto) {
        try {
            dto.card_id = nanoid();
            dto.list_id = this.convertStatusToListId(dto.card_deal_status);
            dto.card_deal_offers = this.convertOffersToArray(dto.card_deal_offers);

            if (dto.card_deal_manager_email) {
                const user = await this.userRepository.findOne({
                    where: {
                        user_email: dto.card_deal_manager_email,
                    },
                });
                console.log('есть ли card_deal_manager_email?', dto.card_deal_manager_email);
                if (user) {
                    console.log('шарим юзера', user);
                    console.log('проверяем ID юзера', user.user_id);
                    dto.memberIds = [user.user_id];
                }
            }

            const card = await this.cardRepository.create(dto);
            const board = await this.boardRepository.findByPk(dto.board_id);

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
                        where: { board_id: dto.board_id },
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

    async createCard(dto: CreateCardFromBeeDto) {
        let contact_id;

        //Проверяем наличие контакта
        const contact = await this.contactRepository.findOne({
            where: {
                contact_email: dto.contact_email,
            },
            include: [{ model: Card }],
        });

        if (!contact) {
            // если нет контакта с таким мылом - мы просто обновляем старый контакт.
            let contactName = dto.contact_first_name;
            if (dto.contact_last_name) {
                contactName = contactName + ' ' + dto.contact_last_name;
            }

            await this.contactRepository.update(
                {
                    contact_name: contactName,
                    contact_email: dto.contact_email,
                    contact_phone: dto.contact_phone,
                },
                { where: { contact_id: dto.contact_id } },
            );
            contact_id = dto.contact_id;
        } else {
            contact_id = contact.contact_id;
            await this.chatRepository.update(
                { contact_id: contact.contact_id },
                {
                    where: {
                        chat_id: dto.chat_id,
                    },
                },
            );
            await this.contactRepository.destroy({ where: { contact_id: dto.contact_id } });
        }
        const responce = await this.createNewOrderAndUser(dto);
        console.log('responce после создания в GC', responce);
        /* if(responce.data.success){
            const card = await this.cardRepository.create();
        }else {
            throw new NotFoundException(`Возникла ошибка при создании заказа в GC`);
        } */
    }

    async getCard(id) {
        try {
            const card = await this.cardRepository.findOne({
                where: {
                    card_id: id,
                },
                attributes: {
                    exclude: ['updatedAt'],
                },
                include: [
                    { model: Attachment },
                    { model: Comment },
                    {
                        model: Contact,
                        /* attributes: ['contact_name', 'contact_email', 'contact_phone'], */
                    },
                ],
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
            const cards = await this.cardRepository.findAll({
                where: { board_id },
                attributes: {
                    exclude: ['updatedAt'],
                },
                include: [
                    { model: Attachment },
                    { model: Comment },
                    {
                        model: Contact,
                        /* attributes: ['contact_name', 'contact_email', 'contact_phone'], */
                    },
                ],
            });
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

            if (updatedRowsCount === 0) {
                throw new NotFoundException(`Карточа с id ${dto.card_id} не найдена`);
            }

            const updatedCard = await this.cardRepository.findByPk(dto.card_id, {
                attributes: {
                    exclude: ['updatedAt'],
                },
                include: [
                    { model: Attachment },
                    { model: Comment },
                    {
                        model: Contact,
                        /* attributes: ['contact_name', 'contact_email', 'contact_phone'], */
                    },
                ],
            });

            if (dto.memberIds) {
                const contact = await this.contactRepository.findByPk(updatedCards[0].contact_id);
                this.changeStatusInGc(updatedCard, contact);
            }
            this.EventGateway.ioServer.emit('updateBoard');

            return updatedCard;
        } catch (error) {
            console.log(error);
            console.log('Ошибка при обновлении Карточки');
            return { success: false, error: 'Ошибка при обновлении карточки' };
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
            const updatedCard = await this.cardRepository.findByPk(card_id, {
                attributes: {
                    exclude: ['updatedAt'],
                },
                include: [
                    { model: Attachment },
                    {
                        model: Contact,
                        /* attributes: ['contact_name', 'contact_email', 'contact_phone'], */
                    },
                ],
            });
            this.EventGateway.ioServer.emit('updateBoard');

            this.changeStatusInGc(updatedCard, contact);

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

    async deleteCard(board_id, card_id) {
        try {
            const card = await this.cardRepository.findOne({ where: { card_id: card_id } });

            const board = await this.boardRepository.findOne({
                where: { board_id: board_id },
            });
            if (!board) {
                throw new NotFoundException(`Доска с id ${board_id} не найдена`);
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
            await this.cardRepository.destroy({ where: { card_id: card_id } });
        } catch (error) {
            console.log(error);
            console.log('Ошибка при удалении Карточки');
        }
    }

    // Доп функции

    private listIdFromStatus(status) {
        if (status === 'Новый') {
            return 'new';
        } else if (status === 'В работе') {
            return 'in_work';
        } else if (status === 'Завершен') {
            return 'payed';
        } else if (status === 'Отменен') {
            return 'cancelled';
        } else if (status === 'Ожидаем оплаты') {
            return 'y2yb7-iIWzaeiJ9q4kyKf';
        } else if (status === 'Не подтвержден') {
            return 'cancelled';
        } else if (status === 'Ложный') {
            return 'cancelled';
        } else if (status === 'Отложен') {
            return 'cancelled';
        } else if (status === 'Частично оплачен') {
            return 'part_payed';
        } else if (status === 'Ожидаем возврата') {
            return 'cancelled';
        } else {
            return 'what??';
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

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=add&key=${GC_SECRET_KEY}&params=${encodeURIComponent(base64Data)}`,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    private async createNewOrderAndUser(dto) {
        try {
            const data = {
                user: {
                    email: dto.contact_email,
                    phone: dto.contact_phone,
                    first_name: dto.contact_first_name,
                    last_name: dto.contact_last_name,
                    addfields: { 'Чат в BeeCRM': `https://beechat.ru/apps/chat/${dto.chat_id}` },
                },
                system: {
                    refresh_if_exists: 0,
                    multiple_offers: 1,
                    return_deal_number: 1,
                },
                deal: {
                    offer_code: dto.card_deal_offers[0].id,
                    deal_cost: dto.card_deal_offers[0].cost,
                    /* deal_number: '29900',
                    deal_cost: '990',
                    deal_status: 'in_work',
                    product_title: 'Функциональный тренинг',
                    manager_email: null, */
                },
            };

            const jsonData = JSON.stringify(data);
            const base64Data = Buffer.from(jsonData).toString('base64');
            let responce;

            const apiUrl = `https://linnik-fitness1.getcourse.ru/pl/api/deals`;
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=add&key=${GC_SECRET_KEY}&params=${encodeURIComponent(base64Data)}`,
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    responce = data;
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

            return responce;
        } catch (error) {}
    }
    private convertOffersToArray(string) {
        const arrayFromString = string.split(',');
        return arrayFromString;
    }
}
