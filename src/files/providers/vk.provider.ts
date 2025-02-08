import { Injectable } from '@nestjs/common';
import { vkBot } from 'src/messengers/bots.init';
import axios from 'axios';
import * as fs from 'fs';

@Injectable()
export class VkProvider {
    async downloadFile(fileId: string) {
        /*  const fileUrl = await vkBot.getAttachmentUrl(fileId);
        const filePath = `uploads/${fileId}.jpg`;

        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, response.data);

        return filePath; */
    }
}
