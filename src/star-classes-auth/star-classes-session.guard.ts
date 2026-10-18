import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { STAR_CLASSES_SESSION_COOKIE, star_classes_session_service } from "./star-classes-session.service";
import type { star_classes_request } from "./star-classes-request.type";

@Injectable()
export class star_classes_session_guard implements CanActivate {
    constructor(private readonly sessionService: star_classes_session_service) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<star_classes_request>();

        const sessionId = request.cookies?.[STAR_CLASSES_SESSION_COOKIE];
        if (!sessionId) {
            throw new UnauthorizedException("Требуется авторизация");
        }

        const session = await this.sessionService.findStarClassSession(sessionId);
        if (!session) {
            throw new UnauthorizedException("Сессия недействительна или истекла");
        }

        request.currentUserId = session.userId;
        return true;
    }
}
