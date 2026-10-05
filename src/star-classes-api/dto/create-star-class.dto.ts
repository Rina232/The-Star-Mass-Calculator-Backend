import { IsString, MinLength, MaxLength } from "class-validator";

export class CreateStarClassDto {
    @IsString()
    @MinLength(3, { message: "Название должно быть не менее 3 символов" })
    @MaxLength(150)
    title: string;
}
