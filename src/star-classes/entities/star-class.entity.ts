import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { app_user } from "./star-class-users.entity";

export type star_class_status = "draft" | "published" | "deleted";

@Entity("star_classes")
export class star_class {
    @PrimaryGeneratedColumn({ name: "star_class_id" })
    star_class_id: number;

    @Column({ name: "star_class_title", type: "varchar", length: 150 })
    star_class_title: string;

    @Column({ name: "star_class_description", type: "varchar", length: 500, default: "" })
    star_class_description: string;

    @Column({ name: "star_class_status", type: "varchar", length: 20, default: "draft" })
    star_class_status: star_class_status;

    @Column({ name: "star_class_image_url", type: "varchar", length: 255, default: "" })
    star_class_image_url: string;

    @Column({ name: "star_class_video_url", type: "varchar", length: 255, default: "" })
    star_class_video_url: string;

    @Column({ name: "star_class_mass", type: "numeric", precision: 10, scale: 2, default: 0 })
    star_class_mass: number;

    @Column({ name: "star_class_luminosity", type: "numeric", precision: 12, scale: 2, default: 0 })
    star_class_luminosity: number;

    @CreateDateColumn({ name: "star_class_created_at", type: "timestamp" })
    star_class_created_at: Date;

    @Column({ name: "star_class_published_at", type: "timestamp", nullable: true })
    star_class_published_at: Date | null;

    @ManyToOne(() => app_user, { onDelete: "RESTRICT", nullable: false })
    @JoinColumn({ name: "star_class_creator_id" })
    star_class_creator: app_user;

    @Column({ name: "star_class_creator_id" })
    star_class_creator_id: number;
}
