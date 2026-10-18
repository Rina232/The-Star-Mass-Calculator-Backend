import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

export const STAR_CLASSES_SESSION_COOKIE = "sessionId";

export const STAR_CLASSES_SESSION_TTL_SECONDS = 60 * 60;

export type star_classes_session_data = {
    userId: number;
    username: string;
};

@Injectable()
export class star_classes_session_service implements OnModuleDestroy {
    private readonly logger = new Logger(star_classes_session_service.name);
    private readonly redis: Redis;

    constructor(private readonly configService: ConfigService) {
        this.redis = new Redis({
            host: this.configService.get<string>("REDIS_HOST", "localhost"),
            port: Number(this.configService.get<string>("REDIS_PORT", "6379")),
        });
        this.redis.on("error", (error) => {
            this.logger.error(`Ошибка Redis: ${error.message}`);
        });
    }

    private buildSessionKey(sessionId: string): string {
        return `session:${sessionId}`;
    }

    async createStarClassSession(sessionId: string, data: star_classes_session_data): Promise<void> {
        const key = this.buildSessionKey(sessionId);
        await this.redis
            .multi()
            .hset(key, { userId: String(data.userId), username: data.username })
            .expire(key, STAR_CLASSES_SESSION_TTL_SECONDS)
            .exec();
    }

    async findStarClassSession(sessionId: string): Promise<star_classes_session_data | null> {
        const stored = await this.redis.hgetall(this.buildSessionKey(sessionId));
        if (!stored.userId) {
            return null;
        }
        return { userId: Number(stored.userId), username: stored.username };
    }

    async destroyStarClassSession(sessionId: string): Promise<void> {
        await this.redis.del(this.buildSessionKey(sessionId));
    }

    async onModuleDestroy(): Promise<void> {
        await this.redis.quit();
    }
}
