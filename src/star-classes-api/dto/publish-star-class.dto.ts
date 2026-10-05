import { IsNumber, IsString, MaxLength, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class PublishStarClassDto {
    @IsString()
    @MinLength(3, { message: "Описание должно быть не менее 3 символов" })
    @MaxLength(500)
    description: string;

    @Type(() => Number)
    @IsNumber()
    mass: number;

    @Type(() => Number)
    @IsNumber()
    luminosity: number;
}
