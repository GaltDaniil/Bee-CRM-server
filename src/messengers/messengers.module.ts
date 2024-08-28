import { Module } from '@nestjs/common';
import { VkModule } from './vk/vk.module';
import { TelegramModule } from './telegram/telegram.module';
import { BeeChatModule } from './beechat/beechat.module';
import { WaModule } from './wa/wa.module';

@Module({
    providers: [],
    imports: [VkModule, TelegramModule, BeeChatModule, WaModule],
})
export class MessengersModule {}
