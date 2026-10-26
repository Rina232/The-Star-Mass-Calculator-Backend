import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class StarClassResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: "Тестовый класс" })
    title: string;

    @ApiProperty({  example: "Тестовое описание", type: String, nullable: true })
    description: string | null;

    @ApiProperty({ enum: ["draft", "published", "deleted"] })
    status: string;

    @ApiProperty({ example: "http://localhost:9000/media/spektralnyy-klass-o-1758499274000-842391.jpg" })
    imageUrl: string;

    @ApiProperty({ example: "http://localhost:9000/media/spektralnyy-klass-o-1758499275000-117452.mp4" })
    videoUrl: string;

    @ApiProperty({ type: Number, nullable: true })
    mass: number | null;

    @ApiProperty({ type: Number, nullable: true })
    luminosity: number | null;

    @ApiProperty({ example: 3 })
    likeCount: number;

    @ApiPropertyOptional({
        enum: [0, 1]
    })
    isMine?: 0 | 1;

    @ApiPropertyOptional({
        enum: [0, 1]
    })
    isLiked?: 0 | 1;

    @ApiProperty({ type: String, format: "date-time" })
    createdAt: Date;

    @ApiProperty({ type: String, format: "date-time", nullable: true })
    publishedAt: Date | null;
}
