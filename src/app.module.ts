import { Module } from "@nestjs/common";
import { star_classes_module } from "./star-classes/star-classes.module";

@Module({
    imports: [star_classes_module],
})
export class AppModule {}
