import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    Query,
    Redirect,
    Render,
} from "@nestjs/common";
import { star_classes_service } from "./star-classes.service";

@Controller()
export class star_classes_controller {
    constructor(private readonly star_class_service: star_classes_service) {}

    @Get(["star_classes_feed", "star_classes_feed/:id"])
    @Render("star_classes_feed")
    async getFeed(@Param("id") id?: string, @Query("next") next?: string) {
        const star_class = id
            ? next === "true"
                ? await this.star_class_service.findNextPublished(Number(id))
                : await this.star_class_service.findPublishedById(Number(id))
            : await this.star_class_service.findFirstPublished();

        if (!star_class) {
            throw new NotFoundException("Спектральный класс не найден");
        }

        const rawLikeCount = await this.star_class_service.getLikeCount(star_class.star_class_id);
        const alreadyLiked = await this.star_class_service.hasCurrentUserLiked(star_class.star_class_id);

        const likeCount = alreadyLiked ? rawLikeCount - 1 : rawLikeCount;
        const likeCountPlusOne = alreadyLiked ? rawLikeCount : rawLikeCount + 1;

        return {
            page: "star_classes_feed",
            star_class,
            imageUrl: this.star_class_service.getImageUrl(star_class),
            videoUrl: this.star_class_service.getVideoUrl(star_class),
            likeCount,
            likeCountPlusOne,
            alreadyLiked,
            massFormatted: this.star_class_service.formatAstroNumber(star_class.star_class_mass),
            luminosityFormatted: this.star_class_service.formatAstroNumber(star_class.star_class_luminosity),
        };
    }

    @Get("star_classes_add")
    @Render("star_classes_add")
    async getAddPage() {
        const draft = await this.star_class_service.findDraftForCurrentUser();

        if (!draft) {
            return {
                page: "star_classes_add",
                hasDraft: false,
                imageUrl: this.star_class_service.getDefaultImageUrl(),
                videoUrl: this.star_class_service.getDefaultVideoUrl(),
            };
        }

        return {
            page: "star_classes_add",
            hasDraft: true,
            star_class: draft,
            imageUrl: this.star_class_service.getImageUrl(draft),
            videoUrl: this.star_class_service.getVideoUrl(draft),
        };
    }

    @Get("star_classes_catalog")
    @Render("star_classes_catalog")
    async getCatalog(@Query("min") min?: string, @Query("max") max?: string) {
        const minMass = min ? Number(min) : undefined;
        const maxMass = max ? Number(max) : undefined;

        const published = await this.star_class_service.findAllPublished(minMass, maxMass);

        const items = await Promise.all(
            published.map(async (star_class) => ({
                star_class,
                imageUrl: this.star_class_service.getImageUrl(star_class),
                likeCount: await this.star_class_service.getLikeCount(star_class.star_class_id),
            })),
        );

        return {
            page: "star_classes_catalog",
            items,
            filters: { min: min || "0", max: max || "25" },
        };
    }

    @Post("star_classes_add/create")
    @Redirect("/star_classes_add", 302)
    async createDraft(@Body("title") title: string) {
        const existingDraft = await this.star_class_service.findDraftForCurrentUser();
        if (!existingDraft) {
            await this.star_class_service.createDraft(title?.trim() || "Новый спектральный класс");
        }
    }

    @Post("star_classes_add/publish")
    @Redirect("/star_classes_feed", 302)
    async publishDraft(
        @Body("description") description: string,
        @Body("mass") mass: string,
        @Body("luminosity") luminosity: string,
    ) {
        const draft = await this.star_class_service.findDraftForCurrentUser();
        if (draft) {
            await this.star_class_service.publishDraft(
                draft.star_class_id,
                description?.trim() || "",
                Number(mass) || 0,
                Number(luminosity) || 0,
            );
        }
    }

    @Post("star_classes_catalog/delete")
    @Redirect("/star_classes_catalog", 302)
    async deleteStarClass(@Body("id") id: string) {
        const numericId = Number(id);
        if (!Number.isNaN(numericId)) {
            await this.star_class_service.deleteStarClass(numericId);
        }
    }
}
