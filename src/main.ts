import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { join } from "path";
const hbs = require("hbs");
const cookieParser = require("cookie-parser");

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.use(cookieParser());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.setBaseViewsDir(join(__dirname, "..", "views"));
    app.setViewEngine("hbs");

    hbs.registerPartials(join(__dirname, "..", "views/partials"));

    hbs.registerHelper(
        "ifEquals",
        function (this: any, a: unknown, b: unknown, options: any) {
            return a === b ? options.fn(this) : options.inverse(this);
        },
    );

    app.useStaticAssets(join(__dirname, "..", "public"));

    const swaggerConfig = new DocumentBuilder()
        .setTitle("Star Classes API")
        .setDescription(
            "REST API спектральных классов звёзд. Чтение (список, лента) доступно гостю. " +
                "Методы создателя требуют авторизации: сначала выполните POST /api/users/login - " +
                "браузер сохранит cookie sessionId и Swagger будет отправлять её автоматически.",
        )
        .setVersion("1.0")
        .addCookieAuth("sessionId")
        .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, swaggerDocument);

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
