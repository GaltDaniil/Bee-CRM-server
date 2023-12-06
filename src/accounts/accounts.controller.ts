import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/account.dto';
import { AccountModel } from './accounts.model';

@Controller('accounts')
export class AccountsController {
    constructor(private accountsService: AccountsService) {}

    /* @Get()
    getAllAccounts(): Account[] {
        return this.AccountsService.getAllAccounts();
    } */

    @Get(':id')
    getAccountById(@Param('id') id: string) {
        return this.accountsService.getAccountById(id);
    }

    @Post()
    createAccount(@Body() dto: CreateAccountDto) {
        return this.accountsService.createAccount(dto);
    }

    /* @Put(':id')
    updateAccount(@Param('id') id: number, @Body() dto: updateAccountDto): Account {
        return this.AccountsService.updateAccount(id, dto);
    }

    @Delete(':id')
    deleteAccount(@Param('id') id: number): Account {
        return this.AccountsService.deleteAccount(id);
    } */
}
