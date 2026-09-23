import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { star_class } from "./entities/star-class.entity";
import { star_class_like } from "./entities/star-class-like.entity";

export const CURRENT_USER_ID = 1;

const DEFAULT_IMAGE_URL = "/default/star-class-default.jpg";
const DEFAULT_VIDEO_URL = "/default/star-class-default.mp4";

const SUPERSCRIPT_DIGITS: Record<string, string> = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    "-": "⁻",
};

function toSuperscript(value: number): string {
    return String(value)
        .split("")
        .map((ch) => SUPERSCRIPT_DIGITS[ch] ?? ch)
        .join("");
}

@Injectable()
export class star_classes_service {
    constructor(
        @InjectRepository(star_class)
        private readonly starClassRepository: Repository<star_class>,
        @InjectRepository(star_class_like)
        private readonly likeRepository: Repository<star_class_like>,
    ) {}


    async findFirstPublishedStarClass(): Promise<star_class | null> {
        return this.starClassRepository.findOne({
            where: { star_class_status: "published" },
            order: { star_class_id: "ASC" },
        });
    }

    async findPublishedStarClassById(id: number): Promise<star_class | null> {
        return this.starClassRepository.findOne({
            where: { star_class_id: id, star_class_status: "published" },
        });
    }

    async findNextPublishedStarClass(afterId: number): Promise<star_class | null> {
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

    async findAllPublishedStarClasses(minMass?: number, maxMass?: number): Promise<star_class[]> {
        const qb = this.starClassRepository
            .createQueryBuilder("sc")
            .where("sc.star_class_status = :status", { status: "published" });

        if (minMass !== undefined && !Number.isNaN(minMass)) {
            qb.andWhere("sc.star_class_mass >= :minMass", { minMass });
        }
        if (maxMass !== undefined && !Number.isNaN(maxMass)) {
            qb.andWhere("sc.star_class_mass <= :maxMass", { maxMass });
        }

        return qb.orderBy("sc.star_class_id", "ASC").getMany();
    }

    async findDraftStarClassForCurrentUser(): Promise<star_class | null> {
        return this.starClassRepository.findOne({
            where: { star_class_status: "draft", star_class_creator_id: CURRENT_USER_ID },
        });
    }

    async createDraftStarClass(title: string): Promise<star_class> {
        const draft = this.starClassRepository.create({
            star_class_title: title,
            star_class_description: "",
            star_class_status: "draft",
            star_class_image_url: "",
            star_class_video_url: "",
            star_class_mass: 0,
            star_class_luminosity: 0,
            star_class_creator_id: CURRENT_USER_ID,
        });
        return this.starClassRepository.save(draft);
    }

    async publishStarClassDraft(
        id: number,
        description: string,
        mass: number,
        luminosity: number,
    ): Promise<void> {
        await this.starClassRepository.update(
            { star_class_id: id, star_class_creator_id: CURRENT_USER_ID, star_class_status: "draft" },
            {
                star_class_description: description,
                star_class_mass: mass,
                star_class_luminosity: luminosity,
                star_class_status: "published",
                star_class_published_at: new Date(),
            },
        );
    }

    async deleteStarClass(id: number): Promise<void> {
        await this.starClassRepository.query(
            `UPDATE star_classes SET star_class_status = $1 WHERE star_class_id = $2`,
            ["deleted", id],
        );
    }


    async getLikeCount(starClassId: number): Promise<number> {
        return this.likeRepository.count({ where: { star_class_id: starClassId } });
    }

    async hasCurrentUserLiked(starClassId: number): Promise<boolean> {
        const existing = await this.likeRepository.findOne({
            where: { star_class_user_id: CURRENT_USER_ID, star_class_id: starClassId },
        });
        return !!existing;
    }


    getImageUrl(sc: star_class): string {
        return sc.star_class_image_url && sc.star_class_image_url.trim()
            ? sc.star_class_image_url
            : DEFAULT_IMAGE_URL;
    }

    getVideoUrl(sc: star_class): string {
        return sc.star_class_video_url && sc.star_class_video_url.trim()
            ? sc.star_class_video_url
            : DEFAULT_VIDEO_URL;
    }

    getDefaultImageUrl(): string {
        return DEFAULT_IMAGE_URL;
    }

    getDefaultVideoUrl(): string {
        return DEFAULT_VIDEO_URL;
    }

    formatAstroNumber(value: number): string {
        const numericValue = Number(value);
        if (!numericValue) {
            return "0";
        }

        const integerDigitsCount = Math.floor(Math.abs(numericValue)).toString().length;

        if (integerDigitsCount <= 3) {
            return Number(numericValue.toFixed(2)).toString();
        }

        const exponent = Math.floor(Math.log10(Math.abs(numericValue)));
        const mantissa = Number((numericValue / 10 ** exponent).toFixed(1));

        return `${mantissa}×10${toSuperscript(exponent)}`;
    }
}
