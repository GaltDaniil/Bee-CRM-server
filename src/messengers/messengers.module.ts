import { Module } from '@nestjs/common';
import { VkModule } from './vk/vk.module';
import { TelegramModule } from './telegram/telegram.module';
import { BeeChatModule } from './beechat/beechat.module';

@Module({
    providers: [],
    imports: [VkModule, TelegramModule, BeeChatModule],
})
export class MessengersModule {}
