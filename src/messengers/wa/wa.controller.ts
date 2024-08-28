import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { WaService } from './wa.service';

@Controller('wa')
export class WaController {
    constructor(private WaService: WaService) {}
    @Get('/check')
    check(@Query() query: { contact_phone: string; contact_id: string }) {
        return this.WaService.checkWaNumber(query.contact_phone, query.contact_id);
    }
}
