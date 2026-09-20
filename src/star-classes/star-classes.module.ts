import { Module } from "@nestjs/common";
import { star_classes_controller } from "./star-classes.controller";
import { star_classes_service } from "./star-classes.service";

@Module({
    controllers: [star_classes_controller],
    providers: [star_classes_service],
})
export class star_classes_module {}
