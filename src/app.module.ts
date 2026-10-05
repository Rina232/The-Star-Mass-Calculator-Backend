import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { star_classes_module } from "./star-classes/star-classes.module";
import { CommonModule } from "./common/common.module";
import { UsersApiModule } from "./users-api/users-api.module";
import { star_classes_api_module } from "./star-classes-api/star-classes-api.module";

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
        CommonModule,
        UsersApiModule,
        star_classes_api_module,
    ],
})
export class AppModule {}
