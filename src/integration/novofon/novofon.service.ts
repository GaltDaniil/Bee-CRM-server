import { Injectable } from '@nestjs/common';
import { AttachmentsService } from 'src/attachments/attachments.service';
import { ChatsService } from 'src/chats/chats.service';
import { ContactsService } from 'src/contacts/contacts.service';
import { EventGateway } from 'src/event/event.gateway';
import { FilesService } from 'src/files/files.service';
import { MessagesService } from 'src/messages/messages.service';

import { Client, Message } from 'whatsapp-web.js';
import axios from 'axios';

@Injectable()
export class NovofonService {
    constructor() /* private contactsService: ContactsService,
        private messagesService: MessagesService,
        private chatsService: ChatsService,
        private filesService: FilesService,
        private attachmentsService: AttachmentsService,
        private eventGateway: EventGateway, */
    {}
}
