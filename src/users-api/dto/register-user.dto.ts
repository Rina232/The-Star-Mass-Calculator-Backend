import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, MaxLength } from "class-validator";

export class RegisterUserDto {
    @ApiProperty({ example: "newstudent", minLength: 3, maxLength: 50 })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @ApiProperty({ example: "test1234", minLength: 4, maxLength: 50 })
    @IsString()
    @MinLength(4)
    @MaxLength(50)
    password: string;
}
