import { Module } from '@nestjs/common';
import { BeeChatService } from './beechat.service';

@Module({
    providers: [BeeChatService],
})
export class BeeChatModule {}
