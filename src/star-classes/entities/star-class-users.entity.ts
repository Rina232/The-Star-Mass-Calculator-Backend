import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("star_class_users")
export class star_class_user {
    @PrimaryGeneratedColumn({ name: "star_class_user_id" })
    star_class_user_id: number;

    @Column({ name: "star_class_username", type: "varchar", length: 50, unique: true })
    star_class_username: string;

    @Column({ name: "star_class_password", type: "varchar", length: 50 })
    star_class_password: string;
}
