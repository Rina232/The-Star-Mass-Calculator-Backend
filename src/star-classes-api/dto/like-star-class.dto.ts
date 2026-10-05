import { IsIn } from "class-validator";
import { Type } from "class-transformer";

export class LikeStarClassDto {
    @Type(() => Number)
    @IsIn([0, 1], { message: "Поле like должно быть 0 (убрать лайк) или 1 (поставить лайк)" })
    like: 0 | 1;
}
