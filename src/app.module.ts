import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { star_classes_module } from "./star-classes/star-classes.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: join(__dirname, "..", ".env"),
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: "postgres",
                host: config.get("DB_HOST", "localhost"),
                port: config.get("DB_PORT", 5432),
                username: config.get("DB_USERNAME"),
                password: config.get("DB_PASSWORD"),
                database: config.get("DB_NAME"),
                autoLoadEntities: true,
                synchronize: false,
            }),
        }),
        star_classes_module,
    ],
})
export class AppModule {}
