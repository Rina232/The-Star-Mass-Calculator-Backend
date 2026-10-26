import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, MaxLength } from "class-validator";

export class CreateStarClassDto {
    @ApiProperty({ example: "Тестовый класс", minLength: 3, maxLength: 150 })
    @IsString()
    @MinLength(3)
    @MaxLength(150)
    title: string;
}
