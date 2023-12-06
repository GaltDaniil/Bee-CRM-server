import { Body, Injectable, Param } from '@nestjs/common';
import { CreateAccountDto, updateAccountDto } from './dto/account.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from './accounts.model';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdef123456789', 24);

@Injectable()
export class AccountsService {
    constructor(@InjectModel(Account) private accountRepository: typeof Account) {}

    /*  async getAllAccounts(): AccountModel[] {
        return ;
    } */

    async createAccount(dto: CreateAccountDto) {
        //@ts-ignore
        dto.account_id = nanoid();

        const user = await this.accountRepository.create(dto);
        return user;
    }

    async getAccountById(id: string) {
        try {
            const account = await this.accountRepository.findOne({ where: { account_id: id } });

            if (!account) return;
            return account;
        } catch (error) {
            console.log(error);
        }
    }

    /* updateAccount(@Param('id') id: number, @Body() updateAccountDto: CreateAccountDto): AccountModel {
        return this.AccountsService.updateAccount(id, updateAccountDto);
    }
    
    deleteAccount(@Param('id') id: number): AccountModel {
        return this.AccountsService.deleteAccount(id);
    } */
}
