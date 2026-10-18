import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: "student" })
    username: string;
}
