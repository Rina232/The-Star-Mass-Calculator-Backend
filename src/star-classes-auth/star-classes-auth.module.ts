import { Global, Module } from "@nestjs/common";
import { star_classes_session_service } from "./star-classes-session.service";
import { star_classes_session_guard } from "./star-classes-session.guard";
import { star_classes_optional_session_guard } from "./star-classes-optional-session.guard";

@Global()
@Module({
    providers: [
        star_classes_session_service,
        star_classes_session_guard,
        star_classes_optional_session_guard,
    ],
    exports: [
        star_classes_session_service,
        star_classes_session_guard,
        star_classes_optional_session_guard,
    ],
})
export class star_classes_auth_module {}
