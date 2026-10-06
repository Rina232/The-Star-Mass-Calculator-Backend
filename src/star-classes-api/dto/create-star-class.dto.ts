import { IsString, MinLength, MaxLength } from "class-validator";

export class CreateStarClassDto {
    @IsString()
    @MinLength(3)
    @MaxLength(150)
    title: string;
}
