import { DataSource } from "typeorm";
import { star_class } from "../src/star-classes/entities/star-class.entity";
import { star_class_like } from "../src/star-classes/entities/star-class-like.entity";
import { star_class_user } from "../src/star-classes/entities/star-class-users.entity";

const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5433", 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [star_class, star_class_like, star_class_user],
    synchronize: true,
});

async function run() {
    await dataSource.initialize();
    await dataSource.synchronize();
    console.log("Миграции выполнены успешно: таблицы star_class_users, star_classes, star_class_likes созданы.");
    await dataSource.destroy();
    process.exit(0);
}

run().catch((err) => {
    console.error("Ошибка миграций:", err);
    process.exit(1);
});
