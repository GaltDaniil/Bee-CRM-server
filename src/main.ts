import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TelegramService } from './messengers/telegram/telegram.service';

async function bootstrap() {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.setGlobalPrefix('api');
    const telegramService = app.get(TelegramService);
    telegramService.init();

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
