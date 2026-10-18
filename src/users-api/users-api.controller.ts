import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import {
    ApiConflictResponse,
    ApiCookieAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { Response } from "express";
import { UsersApiService } from "./users-api.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import {
    STAR_CLASSES_SESSION_COOKIE,
    STAR_CLASSES_SESSION_TTL_SECONDS,
} from "../star-classes-auth/star-classes-session.service";
import { star_classes_session_guard } from "../star-classes-auth/star-classes-session.guard";
import type { star_classes_request } from "../star-classes-auth/star-classes-request.type";

@ApiTags("Пользователь")
@Controller("api/users")
export class UsersApiController {
    constructor(private readonly usersApiService: UsersApiService) {}

    // POST /api/users/register
    @Post("register")
    @ApiOperation({ summary: "Регистрация нового пользователя" })
    @ApiCreatedResponse({ type: UserResponseDto, description: "Пользователь создан" })
    @ApiConflictResponse({ description: "Пользователь с таким именем уже существует" })
    async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
        return this.usersApiService.register(dto);
    }

    // POST /api/users/login
    @Post("login")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: "Аутентификация",
        description:
            "Проверяет имя и пароль, создаёт сессию в Redis и выдаёт cookie sessionId (HttpOnly). " +
            "Браузер (в том числе Swagger UI) автоматически отправляет эту cookie во всех следующих запросах.",
    })
    @ApiOkResponse({ type: UserResponseDto, description: "Вход выполнен, cookie sessionId установлена" })
    @ApiUnauthorizedResponse({ description: "Неверное имя пользователя или пароль" })
    async login(
        @Body() dto: LoginUserDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<UserResponseDto> {
        const { sessionId, user } = await this.usersApiService.login(dto);

        response.cookie(STAR_CLASSES_SESSION_COOKIE, sessionId, {
            httpOnly: true, // кука недоступна из JavaScript страницы - защита от XSS
            secure: false, // true включают только при работе по HTTPS
            sameSite: "lax",
            maxAge: STAR_CLASSES_SESSION_TTL_SECONDS * 1000,
        });

        return user;
    }

    // POST /api/users/logout
    @Post("logout")
    @HttpCode(HttpStatus.OK)
    @UseGuards(star_classes_session_guard)
    @ApiCookieAuth()
    @ApiOperation({
        summary: "Деавторизация",
        description: "Удаляет сессию из Redis и очищает cookie. Требует авторизации.",
    })
    @ApiOkResponse({ description: "Сессия удалена" })
    @ApiUnauthorizedResponse({ description: "Нет действующей сессии" })
    async logout(
        @Req() request: star_classes_request,
        @Res({ passthrough: true }) response: Response,
    ): Promise<{ message: string }> {
        await this.usersApiService.logout(request.cookies?.[STAR_CLASSES_SESSION_COOKIE]);
        response.clearCookie(STAR_CLASSES_SESSION_COOKIE);
        return { message: "Вы вышли из системы" };
    }
}
