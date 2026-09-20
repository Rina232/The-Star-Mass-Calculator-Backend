import {
    Controller,
    Get,
    NotFoundException,
    Param,
    Query,
    Render,
} from "@nestjs/common";
import { star_classes_service } from "./star-classes.service";

@Controller()
export class star_classes_controller {
    constructor(private readonly star_class_service:  star_classes_service) {}

    // Лента
    @Get(["star_classes_feed", "star_classes_feed/:id"])
    @Render("star_classes_feed")
    getFeed(@Param("id") id?: string, @Query("next") next?: string) {
        const star_class = id
            ? next === "true"
                ? this.star_class_service.findNextPublished(Number(id))
                : this.star_class_service.findPublishedById(Number(id))
            : this.star_class_service.findFirstPublished();

        if (!star_class) {
            throw new NotFoundException("Спектральный класс не найден");
        }

        const likeCount = this.star_class_service.getLikeCount(star_class);

        return {
            page: "star_classes_feed",
            star_class: star_class,
            imageUrl: this.star_class_service.getImageUrl(star_class),
            videoUrl: this.star_class_service.getVideoUrl(star_class),
            likeCount,
            likeCountPlusOne: likeCount + 1,
            massFormatted: this.star_class_service.formatAstroNumber(star_class.mass),
            luminosityFormatted: this.star_class_service.formatAstroNumber(star_class.luminosity),
        };
    }

    // Добавление
    @Get("star_classes_add")
    @Render("star_classes_add")
    getDraft() {
        const star_class = this.star_class_service.findDraft();
        if (!star_class) {
            throw new NotFoundException("Черновик не найден");
        }
        return {
            page: "star_classes_add",
            star_class: star_class,
            imageUrl: this.star_class_service.getImageUrl(star_class),
            videoUrl: this.star_class_service.getVideoUrl(star_class),
        };
    }

    // Каталог
    @Get("star_classes_catalog")
    @Render("star_classes_catalog")
    getCatalog(@Query("min") min?: string, @Query("max") max?: string) {
        const minMass = min ? Number(min) : undefined;
        const maxMass = max ? Number(max) : undefined;

        const items = this.star_class_service
            .findAllPublished(minMass, maxMass)
            .map((star_class) => ({
                star_class,
                imageUrl: this.star_class_service.getImageUrl(star_class),
                likeCount: this.star_class_service.getLikeCount(star_class),
            }));

        return {
            page: "star_classes_catalog",
            items,
            filters: { min: min || "0", max: max || "25" },
        };
    }
}
