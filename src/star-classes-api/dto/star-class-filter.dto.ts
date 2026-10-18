import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class StarClassFilterDto {
    @ApiPropertyOptional({ example: 1, description: "Минимальная масса" })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minMass?: number;

    @ApiPropertyOptional({ example: 25, description: "Максимальная масса" })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxMass?: number;
}
