import { Module } from '@nestjs/common';
import { NovofonModule } from './novofon/novofon.module';
import { GetcourseModule } from './getcourse/getcourse.module';
import { BothelpModule } from './bothelp/bothelp.module';

@Module({
    imports: [NovofonModule, GetcourseModule, BothelpModule],
})
export class IntegrationModule {}
