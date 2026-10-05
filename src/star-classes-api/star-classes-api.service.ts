import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { star_class } from "../star-classes/entities/star-class.entity";
import { star_class_like } from "../star-classes/entities/star-class-like.entity";
import { CurrentUserService } from "../common/current-user.service";
import { StarClassFilterDto } from "./dto/star-class-filter.dto";
import { StarClassResponseDto } from "./dto/star-class-response.dto";
import { CreateStarClassDto } from "./dto/create-star-class.dto";
import { PublishStarClassDto } from "./dto/publish-star-class.dto";
import { star_classes_minio_service } from "./star-classes-minio.service";

const DEFAULT_IMAGE_URL = "/default/star-class-default.jpg";
const DEFAULT_VIDEO_URL = "/default/star-class-default.mp4";

@Injectable()
export class star_classes_api_service {
    constructor(
        @InjectRepository(star_class)
        private readonly starClassRepository: Repository<star_class>,
        @InjectRepository(star_class_like)
        private readonly starClassLikeRepository: Repository<star_class_like>,
        private readonly currentUserService: CurrentUserService,
        private readonly starClassMinioService: star_classes_minio_service,
    ) {}

    async findPublishedStarClasses(filter: StarClassFilterDto): Promise<StarClassResponseDto[]> {
        const currentUserId = this.currentUserService.getCurrentUserId();

        const query = this.starClassRepository
            .createQueryBuilder("star_class")
            .where("star_class.star_class_status = :status", { status: "published" });

        if (filter.minMass !== undefined) {
            query.andWhere("star_class.star_class_mass >= :minMass", { minMass: filter.minMass });
        }
        if (filter.maxMass !== undefined) {
            query.andWhere("star_class.star_class_mass <= :maxMass", { maxMass: filter.maxMass });
        }

        const starClasses = await query.orderBy("star_class.star_class_id", "ASC").getMany();

        return Promise.all(starClasses.map((sc) => this.toStarClassResponseDto(sc, currentUserId)));
    }

    async createDraftStarClass(
        dto: CreateStarClassDto,
        imageFile?: Express.Multer.File,
        videoFile?: Express.Multer.File,
    ): Promise<StarClassResponseDto> {
        const currentUserId = this.currentUserService.getCurrentUserId();

        const existingDraft = await this.starClassRepository.findOne({
            where: { star_class_status: "draft", star_class_creator_id: currentUserId },
        });
        if (existingDraft) {
            throw new ConflictException(
                "У вас уже есть черновик. Получите его через GET /api/star-classes/draft",
            );
        }
        let imageUrl = "";
        let videoUrl = "";

        if (imageFile) {
            const imageFileName = await this.starClassMinioService.uploadStarClassFile(
                imageFile,
                dto.title,
            );
            imageUrl = this.starClassMinioService.getStarClassFileUrl(imageFileName);
        }

        if (videoFile) {
            const videoFileName = await this.starClassMinioService.uploadStarClassFile(
                videoFile,
                dto.title,
            );
            videoUrl = this.starClassMinioService.getStarClassFileUrl(videoFileName);
        }

        const draft = this.starClassRepository.create({
            star_class_title: dto.title,
            star_class_status: "draft",
            star_class_image_url: imageUrl,
            star_class_video_url: videoUrl,
            star_class_creator_id: currentUserId,
        });

        const savedDraft = await this.starClassRepository.save(draft);

        return this.toStarClassResponseDto(savedDraft, currentUserId);
    }

    async findFeedStarClass(id?: number, next?: boolean): Promise<StarClassResponseDto> {
        const currentUserId = this.currentUserService.getCurrentUserId();

        const starClass = id
            ? next
                ? await this.findNextPublishedStarClass(id)
                : await this.starClassRepository.findOne({
                      where: { star_class_id: id, star_class_status: "published" },
                  })
            : await this.starClassRepository.findOne({
                  where: { star_class_status: "published" },
                  order: { star_class_id: "ASC" },
              });

        if (!starClass) {
            throw new NotFoundException("Спектральный класс не найден");
        }

        return this.toStarClassResponseDto(starClass, currentUserId, true);
    }

    private async findNextPublishedStarClass(afterId: number): Promise<star_class | null> {
        const list = await this.starClassRepository.find({
            where: { star_class_status: "published" },
            order: { star_class_id: "ASC" },
        });
        if (list.length === 0) {
            return null;
        }
        const index = list.findIndex((s) => s.star_class_id === afterId);
        if (index === -1) {
            return list[0];
        }
        return list[(index + 1) % list.length];
    }

    async findDraftStarClass(): Promise<StarClassResponseDto> {
        const currentUserId = this.currentUserService.getCurrentUserId();

        const draft = await this.starClassRepository.findOne({
            where: { star_class_status: "draft", star_class_creator_id: currentUserId },
        });

        if (!draft) {
            throw new NotFoundException("Черновик не найден");
        }

        return this.toStarClassResponseDto(draft, currentUserId);
    }

    async publishStarClass(id: number, dto: PublishStarClassDto): Promise<StarClassResponseDto> {
        const currentUserId = this.currentUserService.getCurrentUserId();

        const draft = await this.starClassRepository.findOne({
            where: {
                star_class_id: id,
                star_class_creator_id: currentUserId,
                star_class_status: "draft",
            },
        });

        if (!draft) {
            throw new NotFoundException(
                "Черновик с таким id не найден (либо он не ваш, либо уже опубликован)",
            );
        }

        await this.starClassRepository.update(
            { star_class_id: id },
            {
                star_class_description: dto.description,
                star_class_mass: dto.mass,
                star_class_luminosity: dto.luminosity,
                star_class_status: "published",
                star_class_published_at: new Date(),
            },
        );

        const publishedStarClass = await this.starClassRepository.findOneOrFail({
            where: { star_class_id: id },
        });

        return this.toStarClassResponseDto(publishedStarClass, currentUserId);
    }

    async deleteStarClass(id: number): Promise<void> {
        const currentUserId = this.currentUserService.getCurrentUserId();

        const starClass = await this.starClassRepository.findOne({
            where: { star_class_id: id, star_class_creator_id: currentUserId },
        });

        if (!starClass || starClass.star_class_status === "deleted") {
            throw new NotFoundException("Услуга не найдена, не ваша или уже удалена");
        }

        await this.starClassRepository.update(
            { star_class_id: id },
            { star_class_status: "deleted" },
        );
    }

    async setStarClassLike(id: number, like: 0 | 1): Promise<StarClassResponseDto> {
        const currentUserId = this.currentUserService.getCurrentUserId();

        const starClass = await this.starClassRepository.findOne({
            where: { star_class_id: id, star_class_status: "published" },
        });
        if (!starClass) {
            throw new NotFoundException("Спектральный класс не найден");
        }

        const existingLike = await this.starClassLikeRepository.findOne({
            where: { star_class_user_id: currentUserId, star_class_id: id },
        });

        if (like === 1 && !existingLike) {
            const newLike = this.starClassLikeRepository.create({
                star_class_user_id: currentUserId,
                star_class_id: id,
            });
            await this.starClassLikeRepository.save(newLike);
        } else if (like === 0 && existingLike) {
            await this.starClassLikeRepository.delete({
                star_class_like_id: existingLike.star_class_like_id,
            });
        }

        return this.toStarClassResponseDto(starClass, currentUserId, true);
    }

    private async toStarClassResponseDto(
        starClass: star_class,
        currentUserId: number,
        withLikedFlag = false,
    ): Promise<StarClassResponseDto> {
        const likeCount = await this.starClassLikeRepository.count({
            where: { star_class_id: starClass.star_class_id },
        });

        const dto: StarClassResponseDto = {
            id: starClass.star_class_id,
            title: starClass.star_class_title,
            description: starClass.star_class_description,
            status: starClass.star_class_status,
            imageUrl: starClass.star_class_image_url?.trim()
                ? starClass.star_class_image_url
                : DEFAULT_IMAGE_URL,
            videoUrl: starClass.star_class_video_url?.trim()
                ? starClass.star_class_video_url
                : DEFAULT_VIDEO_URL,
            mass: starClass.star_class_mass,
            luminosity: starClass.star_class_luminosity,
            likeCount,
            isMine: starClass.star_class_creator_id === currentUserId ? 1 : 0,
            createdAt: starClass.star_class_created_at,
            publishedAt: starClass.star_class_published_at,
        };

        if (withLikedFlag) {
            const liked = await this.starClassLikeRepository.findOne({
                where: { star_class_user_id: currentUserId, star_class_id: starClass.star_class_id },
            });
            dto.isLiked = liked ? 1 : 0;
        }

        return dto;
    }
}
