import { Module, forwardRef } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Message } from './messages.model';
import { ChatsModule } from 'src/chats/chats.module';
import { TelegramModule } from 'src/messengers/telegram/telegram.module';
import { EventModule } from 'src/event/event.module';
import { MessengersModule } from 'src/messengers/messengers.module';
import { VkModule } from 'src/messengers/vk/vk.module';

@Module({
    controllers: [MessagesController],
    providers: [MessagesService],
    imports: [SequelizeModule.forFeature([Message]), ChatsModule, EventModule],
    exports: [MessagesService],
})
export class MessagesModule {}
