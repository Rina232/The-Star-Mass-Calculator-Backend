import { randomUUID } from "crypto";
import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { star_class_user } from "../star-classes/entities/star-class-users.entity";
import { star_classes_session_service } from "../star-classes-auth/star-classes-session.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";

@Injectable()
export class UsersApiService {
    constructor(
        @InjectRepository(star_class_user)
        private readonly userRepository: Repository<star_class_user>,
        private readonly sessionService: star_classes_session_service,
    ) {}

    async register(dto: RegisterUserDto): Promise<UserResponseDto> {
        const existing = await this.userRepository.findOne({
            where: { star_class_username: dto.username },
        });
        if (existing) {
            throw new ConflictException();
        }

        const user = this.userRepository.create({
            star_class_username: dto.username,
            star_class_password: dto.password,
        });
        const saved = await this.userRepository.save(user);

        return { id: saved.star_class_user_id, username: saved.star_class_username };
    }

    async login(dto: LoginUserDto): Promise<{ sessionId: string; user: UserResponseDto }> {
        const user = await this.userRepository.findOne({
            where: { star_class_username: dto.username },
        });

        if (!user || user.star_class_password !== dto.password) {
            throw new UnauthorizedException();
        }

        const sessionId = randomUUID();
        await this.sessionService.createStarClassSession(sessionId, {
            userId: user.star_class_user_id,
            username: user.star_class_username,
        });

        return {
            sessionId,
            user: { id: user.star_class_user_id, username: user.star_class_username },
        };
    }

    async logout(sessionId: string | undefined): Promise<void> {
        if (sessionId) {
            await this.sessionService.destroyStarClassSession(sessionId);
        }
    }
}
