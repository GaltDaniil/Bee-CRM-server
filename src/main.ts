import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createServer } from 'http';
import { TelegramService } from './messengers/telegram/telegram.service';
import { VkService } from './messengers/vk/vk.service';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SocketAdapter } from './event/event.adapter';

async function bootstrap() {
    const PORT = process.env.PORT || 5000;

    const app = await NestFactory.create(AppModule, { cors: true });

    /* app.enableCors({
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    }); */
    app.setGlobalPrefix('api');

    const telegramService = app.get(TelegramService);
    const vkService = app.get(VkService);
    telegramService.init();
    vkService.init();

    app.useWebSocketAdapter(new SocketAdapter(app));

    const config = new DocumentBuilder()
        .setTitle('BeeCRM документация')
        .setDescription('Документация REST API')
        .setVersion('1.0.0')
        .addTag('Galt')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/docs', app, document);

    await app.listen(PORT, () => console.log(`сервер запущен на ${PORT} порту`));
}
bootstrap();
