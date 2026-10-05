import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { star_class } from "../star-classes/entities/star-class.entity";
import { star_class_like } from "../star-classes/entities/star-class-like.entity";
import { CommonModule } from "../common/common.module";
import { star_classes_api_controller } from "./star-classes-api.controller";
import { star_classes_api_service } from "./star-classes-api.service";
import { star_classes_minio_service } from "./star-classes-minio.service";

@Module({
    imports: [TypeOrmModule.forFeature([star_class, star_class_like]), CommonModule],
    controllers: [star_classes_api_controller],
    providers: [star_classes_api_service, star_classes_minio_service],
})
export class star_classes_api_module {}
