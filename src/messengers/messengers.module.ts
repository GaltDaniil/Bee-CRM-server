import { Module } from '@nestjs/common';
import { VkModule } from './vk/vk.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
    controllers: [],
    providers: [],
    imports: [VkModule, TelegramModule],
})
export class MessengersModule {}
