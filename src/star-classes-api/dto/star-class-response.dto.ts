export class StarClassResponseDto {
    id: number;
    title: string;
    description: string | null;
    status: string;
    imageUrl: string;
    videoUrl: string;
    mass: number | null;
    luminosity: number | null;
    likeCount: number;

    isMine: 0 | 1;

    isLiked?: 0 | 1;

    createdAt: Date;
    publishedAt: Date | null;
}
