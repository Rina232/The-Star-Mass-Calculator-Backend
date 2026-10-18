import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";
import { Type } from "class-transformer";

export class LikeStarClassDto {
    @ApiProperty({ enum: [0, 1], example: 1, description: "1 - поставить лайк, 0 - отменить" })
    @Type(() => Number)
    @IsIn([0, 1])
    like: 0 | 1;
}
