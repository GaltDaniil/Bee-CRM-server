import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';

@Injectable()
export class WhatsappProvider {
    async downloadFile(fileUrl: string) {
        const filePath = `uploads/${Date.now()}.jpg`;

        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, response.data);

        return filePath;
    }
}
