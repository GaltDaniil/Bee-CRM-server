import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Account } from './accounts.model';

@Module({
    controllers: [AccountsController],
    providers: [AccountsService],
    imports: [SequelizeModule.forFeature([Account])],
})
export class AccountsModule {}
