import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { star_classes_request } from "./star-classes-request.type";

export const StarClassesCurrentUserId = createParamDecorator(
    (_data: unknown, context: ExecutionContext): number | null => {
        const request = context.switchToHttp().getRequest<star_classes_request>();
        return request.currentUserId ?? null;
    },
);
