import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, MaxLength } from "class-validator";

export class CreateStarClassDto {
    @ApiProperty({ example: "Спектральный класс F", minLength: 3, maxLength: 150 })
    @IsString()
    @MinLength(3)
    @MaxLength(150)
    title: string;
}
