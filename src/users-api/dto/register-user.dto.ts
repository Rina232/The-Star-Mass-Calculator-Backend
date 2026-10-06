import { IsString, MinLength, MaxLength } from "class-validator";

export class RegisterUserDto {
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @IsString()
    @MinLength(4)
    @MaxLength(50)
    password: string;
}
