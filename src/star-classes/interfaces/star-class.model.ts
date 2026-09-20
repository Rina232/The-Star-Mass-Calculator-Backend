export type star_class_status = "draft" | "published" | "deleted";

export interface star_class {
    id: number;
    title: string;
    description: string;
    mass: number;
    luminosity: number;
    imageKey: string;
    videoKey: string;
    status: star_class_status;
    likedByUserIds: number[];
}
