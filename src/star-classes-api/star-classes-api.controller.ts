import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UploadedFiles,
    UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { star_classes_api_service } from "./star-classes-api.service";
import { StarClassFilterDto } from "./dto/star-class-filter.dto";
import { StarClassResponseDto } from "./dto/star-class-response.dto";
import { CreateStarClassDto } from "./dto/create-star-class.dto";
import { PublishStarClassDto } from "./dto/publish-star-class.dto";
import { LikeStarClassDto } from "./dto/like-star-class.dto";

const starClassFileUploadInterceptor = FileFieldsInterceptor(
    [
        { name: "image", maxCount: 1 },
        { name: "video", maxCount: 1 },
    ],
    {
        storage: memoryStorage(),
        limits: { fileSize: 20 * 1024 * 1024 },
    },
);

@Controller("api/star-classes")
export class star_classes_api_controller {
    constructor(private readonly starClassesApiService: star_classes_api_service) {}

    // GET /api/star-classes?minMass=1&maxMass=25
    @Get()
    async getPublishedStarClasses(@Query() filter: StarClassFilterDto): Promise<StarClassResponseDto[]> {
        return this.starClassesApiService.findPublishedStarClasses(filter);
    }

    // POST /api/star-classes (multipart/form-data: title, image, video)
    @Post()
    @UseInterceptors(starClassFileUploadInterceptor)
    async createDraftStarClass(
        @Body() dto: CreateStarClassDto,
        @UploadedFiles() files: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
    ): Promise<StarClassResponseDto> {
        return this.starClassesApiService.createDraftStarClass(dto, files?.image?.[0], files?.video?.[0]);
    }

    // GET /api/star-classes/draft
    @Get("draft")
    async getDraftStarClass(): Promise<StarClassResponseDto> {
        return this.starClassesApiService.findDraftStarClass();
    }

    // GET /api/star-classes/feed
    // GET /api/star-classes/feed?id=1
    // GET /api/star-classes/feed?id=1&next=true
    @Get("feed")
    async getFeedStarClass(
        @Query("id") id?: string,
        @Query("next") next?: string,
    ): Promise<StarClassResponseDto> {
        return this.starClassesApiService.findFeedStarClass(id ? Number(id) : undefined, next === "true");
    }

   // PUT /api/star-classes/draft/publish
    @Put("draft/publish")
    async publishDraftStarClass(
        @Body() dto: PublishStarClassDto
    ): Promise<StarClassResponseDto> {
        return this.starClassesApiService.publishDraftStarClass(dto);
    }

    // DELETE /api/star-classes/:id
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteStarClass(
        @Param("id", ParseIntPipe) id: number
    ): Promise<void> {
        await this.starClassesApiService.deleteStarClass(id);
    }

    // POST /api/star-classes/:id/like  (body: { "like": 0 | 1 })
    @Post(":id/like")
    async setStarClassLike(
        @Param("id", ParseIntPipe) id: number,
        @Body() dto: LikeStarClassDto,
    ): Promise<StarClassResponseDto> {
        return this.starClassesApiService.setStarClassLike(id, dto.like);
    }
}
