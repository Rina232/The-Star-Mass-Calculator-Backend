import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { star_class_user } from "../star-classes/entities/star-class-users.entity";
import { RegisterUserDto } from "./dto/register-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";

@Injectable()
export class UsersApiService {
    constructor(
        @InjectRepository(star_class_user)
        private readonly userRepository: Repository<star_class_user>,
    ) {}

    async register(dto: RegisterUserDto): Promise<UserResponseDto> {
        const existing = await this.userRepository.findOne({
            where: { star_class_username: dto.username },
        });
        if (existing) {
            throw new ConflictException("Пользователь с таким именем уже существует");
        }

        const user = this.userRepository.create({
            star_class_username: dto.username,
            star_class_password: dto.password,
        });
        const saved = await this.userRepository.save(user);

        return { id: saved.star_class_user_id, username: saved.star_class_username };
    }
}
