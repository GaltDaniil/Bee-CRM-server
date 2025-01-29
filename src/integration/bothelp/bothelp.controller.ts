import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BothelpService } from './bothelp.service';

@Controller('integration')
export class BothelpController {
    constructor(private BothelpService: BothelpService) {}

    @Post('bothelp/nutri2days')
    createNutriLead2Day(@Body() body) {
        return this.BothelpService.createNutriLead2Day(body);
    }

    @Post('bothelp/update')
    createNutriLead(@Body() body) {
        return this.BothelpService.updateLeadFromBH(body);
    }

    @Post('bothelp/start2days')
    createStartLead2Day(@Body() body) {
        return this.BothelpService.createStartLead2Day(body);
    }
}
