import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { star_classes_controller } from "./star-classes.controller";
import { star_classes_service } from "./star-classes.service";
import { star_class } from "./entities/star-class.entity";
import { star_class_like } from "./entities/star-class-like.entity";
import { star_class_user } from "./entities/star-class-users.entity";

@Module({
    imports: [TypeOrmModule.forFeature([star_class, star_class_like, star_class_user])],
    controllers: [star_classes_controller],
    providers: [star_classes_service],
})
export class star_classes_module {}
