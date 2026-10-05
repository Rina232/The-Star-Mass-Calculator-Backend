import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Minio from "minio";
import { generateStarClassFileName } from "./star-classes-filename.util";

@Injectable()
export class star_classes_minio_service {
    private readonly logger = new Logger(star_classes_minio_service.name);
    private readonly minioClient: Minio.Client;
    private readonly bucketName: string;

    constructor(private readonly configService: ConfigService) {
        this.bucketName = this.configService.get<string>("MINIO_BUCKET", "star-classes");

        this.minioClient = new Minio.Client({
            endPoint: this.configService.get<string>("MINIO_ENDPOINT", "localhost"),
            port: this.configService.get<number>("MINIO_PORT", 9000),
            useSSL: this.configService.get<string>("MINIO_USE_SSL", "false") === "true",
            accessKey: this.configService.get<string>("MINIO_ROOT_USER", "minioadmin"),
            secretKey: this.configService.get<string>("MINIO_ROOT_PASSWORD", "minioadmin"),
        });

        void this.ensureStarClassBucketExists();
    }

    private async ensureStarClassBucketExists(): Promise<void> {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, "us-east-1");
                this.logger.log(`Бакет "${this.bucketName}" создан в Minio`);
            }
        } catch (error) {
            this.logger.error("Не удалось создать/проверить бакет Minio", error);
        }
    }

    async uploadStarClassFile(file: Express.Multer.File, titleHint: string): Promise<string> {
        const fileName = generateStarClassFileName(file.originalname, titleHint);

        await this.minioClient.putObject(this.bucketName, fileName, file.buffer, file.size, {
            "Content-Type": file.mimetype,
        });

        return fileName;
    }

    getStarClassFileUrl(fileName: string): string {
        const useSsl = this.configService.get<string>("MINIO_USE_SSL", "false") === "true";
        const endpoint = this.configService.get<string>("MINIO_ENDPOINT", "localhost");
        const port = this.configService.get<number>("MINIO_PORT", 9000);
        return `${useSsl ? "https" : "http"}://${endpoint}:${port}/${this.bucketName}/${fileName}`;
    }

    async deleteStarClassFile(fileName: string): Promise<void> {
        try {
            await this.minioClient.removeObject(this.bucketName, fileName);
        } catch (error) {
            this.logger.warn(`Не удалось удалить файл "${fileName}" из Minio`, error);
        }
    }
}
