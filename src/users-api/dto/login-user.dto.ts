import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginUserDto {
    @ApiProperty({ example: "student" })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: "test1234" })
    @IsString()
    @IsNotEmpty()
    password: string;
}
