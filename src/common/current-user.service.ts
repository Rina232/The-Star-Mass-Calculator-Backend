import { Injectable } from "@nestjs/common";

@Injectable()
export class CurrentUserService {
    private readonly currentUserId = 1;

    getCurrentUserId(): number {
        return this.currentUserId;
    }
}
