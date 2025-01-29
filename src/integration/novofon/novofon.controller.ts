import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { NovofonService } from './novofon.service';
import { api } from 'zadarma';

import axios from 'axios';
import * as cheerio from 'cheerio';

import * as dotenv from 'dotenv';
dotenv.config();

const { NOVOFON_USER_KEY, NOVOFON_SECRET_KEY } = process.env;

@Controller('integration')
export class NovofonController {
    constructor(private NovofonService: NovofonService) {}

    @Get('/novofon')
    getNovofon(@Query() targetCurrency) {
        console.log('старт валюты', targetCurrency);
        const getKZT = async () => {
            try {
                // Формируем запрос к Google
                const query = `1+RUB+to+${targetCurrency.valuta}`;
                const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

                // Делаем запрос к Google
                const response = await axios.get(url, {
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36',
                    },
                });

                // Парсим HTML через cheerio
                const $ = cheerio.load(response.data);

                // Ищем курс валют
                const rateText = $('span.DFlfde.SwHCTb').first().text();
                console.log('rateText', rateText);
                // Конвертируем в число
                const rate = parseFloat(rateText.replace(',', '.'));
                console.log('rate', rate);

                if (isNaN(rate)) {
                    throw new HttpException('Курс валют не найден', HttpStatus.NOT_FOUND);
                }

                return { rate: rate, currency: targetCurrency.valuta };
            } catch (error) {
                console.error('Ошибка при запросе курса валют:', error.message);
                throw new HttpException(
                    'Ошибка при получении данных о курсе валют',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        };
        return getKZT();
    }

    @Get('/novofon/get')
    novofonGet(@Query() query) {
        console.log('Get от новофона', query);
        const getMethod = async (query) => {
            let dataObj = await api({
                api_method: query,
                api_user_key: NOVOFON_USER_KEY,
                api_secret_key: NOVOFON_SECRET_KEY,
            });
            console.log(dataObj);
            return dataObj;
        };
        return getMethod(query);
    }
    @Get('/novofon/callback')
    novofonPost(@Query() query) {
        const callback = async (query) => {
            console.log('query', query);
            console.log('query.from', query.from);
            console.log('query.to', query.to);
            console.log('query.sip', query.sip);
            let response = await api({
                api_method: '/v1/request/callback/',
                api_user_key: NOVOFON_USER_KEY,
                api_secret_key: NOVOFON_SECRET_KEY,
                params: {
                    from: query.from,
                    to: query.to,
                    sip: query.sip,
                    /* predicted: query.predicted, */
                },
            });
            console.log('response', response);
            return response;
        };
        return callback(query);
    }
}
