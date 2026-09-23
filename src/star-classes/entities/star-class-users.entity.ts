import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("users")
export class app_user {
    @PrimaryGeneratedColumn({ name: "star_class_user_id" })
    star_class_user_id: number;

    @Column({ name: "star_class_username", type: "varchar", length: 50, unique: true })
    star_class_username: string;
}
