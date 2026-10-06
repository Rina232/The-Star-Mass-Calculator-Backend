import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { UsersApiService } from "./users-api.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";

@Controller("api/users")
export class UsersApiController {
    constructor(private readonly usersApiService: UsersApiService) {}

    // POST /api/users/register
    @Post("register")
    async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
        return this.usersApiService.register(dto);
    }

    // POST /api/users/login заглушка
    @Post("login")
    @HttpCode(HttpStatus.OK)
    login() {
        return;
    }

    // POST /api/users/logout заглушка
    @Post("logout")
    @HttpCode(HttpStatus.OK)
    logout() {
        return;
    }
}
