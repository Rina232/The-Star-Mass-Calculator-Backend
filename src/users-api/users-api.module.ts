import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { star_class_user } from "../star-classes/entities/star-class-users.entity";
import { UsersApiController } from "./users-api.controller";
import { UsersApiService } from "./users-api.service";

@Module({
    imports: [TypeOrmModule.forFeature([star_class_user])],
    controllers: [UsersApiController],
    providers: [UsersApiService],
})
export class UsersApiModule {}
