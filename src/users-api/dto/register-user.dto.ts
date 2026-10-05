import { IsString, MinLength, MaxLength } from "class-validator";

export class RegisterUserDto {
    @IsString()
    @MinLength(3, { message: "Имя пользователя должно быть не менее 3 символов" })
    @MaxLength(50)
    username: string;

    @IsString()
    @MinLength(4, { message: "Пароль должен быть не менее 4 символов" })
    @MaxLength(50)
    password: string;
}
