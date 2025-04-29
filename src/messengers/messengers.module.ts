import { Module } from '@nestjs/common';
import { VkModule } from './vk/vk.module';
import { TelegramModule } from './telegram/telegram.module';
import { BeeChatModule } from './beechat/beechat.module';
import { WaModule } from './wa/wa.module';
import { MessengersController } from './messengers.controller';
import { MessengersService } from './messengers.service';

@Module({
    providers: [MessengersService],
    controllers: [MessengersController],
    imports: [VkModule, TelegramModule, BeeChatModule, WaModule],
})
export class MessengersModule {}
