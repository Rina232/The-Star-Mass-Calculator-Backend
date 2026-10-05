import { IsOptional, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class StarClassFilterDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minMass?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxMass?: number;
}
