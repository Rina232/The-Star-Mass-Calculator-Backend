import { IsIn } from "class-validator";
import { Type } from "class-transformer";

export class LikeStarClassDto {
    @Type(() => Number)
    @IsIn([0, 1])
    like: 0 | 1;
}
