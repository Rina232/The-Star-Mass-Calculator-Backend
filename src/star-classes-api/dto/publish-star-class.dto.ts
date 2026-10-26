import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, MaxLength, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class PublishStarClassDto {
    @ApiProperty({ example: "Тестовое описание", maxLength: 500 })
    @IsString()
    @MinLength(3)
    @MaxLength(500)
    description: string;

    @ApiProperty({ example: 1.3 })
    @Type(() => Number)
    @IsNumber()
    mass: number;

    @ApiProperty({ example: 6 })
    @Type(() => Number)
    @IsNumber()
    luminosity: number;
}
