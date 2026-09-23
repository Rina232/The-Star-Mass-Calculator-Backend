import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, Unique } from "typeorm";
import { star_class_user } from "./star-class-users.entity";
import { star_class } from "./star-class.entity";

@Entity("star_class_likes")
@Unique(["star_class_user_id", "star_class_id"])
export class star_class_like {
    @PrimaryGeneratedColumn({ name: "star_class_like_id" })
    star_class_like_id: number;

    @ManyToOne(() => star_class_user, { onDelete: "RESTRICT", nullable: false })
    @JoinColumn({ name: "star_class_user_id" })
    star_class_user: star_class_user;

    @Column({ name: "star_class_user_id" })
    star_class_user_id: number;

    @ManyToOne(() => star_class, { onDelete: "RESTRICT", nullable: false })
    @JoinColumn({ name: "star_class_id" })
    star_class: star_class;

    @Column({ name: "star_class_id" })
    star_class_id: number;
}
