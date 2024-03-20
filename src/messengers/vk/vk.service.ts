import { Injectable } from '@nestjs/common';
import { VK } from 'vk-io';
import { ChatsService } from 'src/chats/chats.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { FilesService } from 'src/files/files.service';
import { MessagesService } from 'src/messages/messages.service';
import * as dotenv from 'dotenv';
import { urlParser } from '../middleware/urlParser';
import axios from 'axios';
import { Contact } from 'src/contacts/contacts.model';
import { EventGateway } from 'src/event/event.gateway';
import { Message } from 'src/messages/messages.model';
import { InjectModel } from '@nestjs/sequelize';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('abcdef123456789', 24);

dotenv.config();

const { VK_TOKEN } = process.env;

@Injectable()
export class VkService {
    constructor(
        @InjectModel(Message) private messageRepository: typeof Message,
        private contactsService: ContactsService,
        private chatsService: ChatsService,
        private filesService: FilesService,
        private eventGateway: EventGateway,
    ) {}
    vkBot: VK;

    init() {
        this.vkBot = new VK({
            token: VK_TOKEN!,
        });

        this.vkBot.updates.on('group_join', (context) => {
            console.log('group_join', context);
        });

        this.vkBot.updates.on('message_new', this.messageHandler);
        this.vkBot.updates.on('message', async (context) => {
            console.log('от группы или админа', context);
            if (context.isGroup == true) return;
            /* let contact_id;
            const messenger_id = context.senderId;
            const messenger_type = 'vk';
            const text = context.text;
            const result = await checkContact(messenger_id, messenger_type);
            if (result) {
                await sendMessage(result.id!, text!, false);
            } */
        });
        this.vkBot.updates.start().catch(console.error);
    }

    messageHandler = async (context) => {
        console.log('от пользователя', context);
        if (context.text.length < 2) return;
        if (context.text === 'начать' || context.text === 'Начать') return;

        const messenger_id = context.senderId.toString();
        let chat_id: string;
        let contact_id: string;

        const isChat = await this.chatsService.getChatByMessengerId(messenger_id);
        if (!isChat) {
            let account_id: string = 'ecfafe4bc756935e17d93bec';

            let contact_photo_url: string;
            let from_url;

            if (context.referralValue) {
                const parsedParams = await urlParser(context.referralValue);
                account_id = parsedParams.account_id || 'ecfafe4bc756935e17d93bec';
                from_url = parsedParams.from_url || '';
            }

            const vkData = await this.vkBot.api.users.get({
                user_ids: [context.senderId],
                fields: ['photo_200_orig', 'nickname'],
            });
            const { photo_200_orig, first_name, last_name, nickname } = vkData[0];

            const contact_name: string = first_name + ' ' + last_name || '';
            const messenger_username: string = nickname || '';

            const response = await axios.get(photo_200_orig, { responseType: 'arraybuffer' });
            const avatarFile = Buffer.from(response.data, 'binary');

            const fileName = await this.filesService.saveAvatarFromMessenger(
                avatarFile,
                messenger_id,
            );
            contact_photo_url = fileName;

            const params = {
                account_id,
                contact_name,
                contact_photo_url,
            };
            const newContact: Contact = await this.contactsService.createContact(params);

            if (newContact) {
                contact_id = newContact.contact_id;
                const params = {
                    contact_id,
                    messenger_id,
                    messenger_type: 'vk',
                    messenger_username,
                    from_url,
                };

                const newChat = await this.chatsService.createChat(params);
                chat_id = newChat.chat_id;
            }
        } else {
            contact_id = isChat.contact_id;
            chat_id = isChat.chat_id;
        }
        const params = {
            message_value: context.text,
            message_type: 'text',
            messenger_type: 'vk',
            manager_id: '',
            contact_id,
            chat_id,
        };

        this.sendMessageFromVk(params);
    };

    sendMessageFromVk = async (params) => {
        //@ts-ignore
        params.message_id = nanoid();
        const message = await this.messageRepository.create(params);

        this.chatsService.addUnreadCount(params.chat_id);
        this.eventGateway.ioServer.emit('update');

        return message;
    };
}
