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
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
    ApiBody,
    ApiConflictResponse,
    ApiConsumes,
    ApiCookieAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { memoryStorage } from "multer";
import { star_classes_api_service } from "./star-classes-api.service";
import { StarClassFilterDto } from "./dto/star-class-filter.dto";
import { StarClassResponseDto } from "./dto/star-class-response.dto";
import { CreateStarClassDto } from "./dto/create-star-class.dto";
import { PublishStarClassDto } from "./dto/publish-star-class.dto";
import { LikeStarClassDto } from "./dto/like-star-class.dto";
import { star_classes_session_guard } from "../star-classes-auth/star-classes-session.guard";
import { star_classes_optional_session_guard } from "../star-classes-auth/star-classes-optional-session.guard";
import { StarClassesCurrentUserId } from "../star-classes-auth/star-classes-current-user-id.decorator";

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

@ApiTags("Услуга")
@Controller("api/star-classes")
export class star_classes_api_controller {
    constructor(private readonly starClassesApiService: star_classes_api_service) {}

    // GET /api/star-classes?minMass=1&maxMass=25
    @Get()
    @UseGuards(star_classes_optional_session_guard)
    @ApiOperation({
        summary: "Список опубликованных услуг с фильтром по массе",
        description:
            "Доступен без авторизации. Поле isMine = 1, если создатель услуги - текущий пользователь " +
            "(для гостя всегда 0).",
    })
    @ApiOkResponse({ type: StarClassResponseDto, isArray: true })
    async getPublishedStarClasses(
        @Query() filter: StarClassFilterDto,
        @StarClassesCurrentUserId() currentUserId: number | null,
    ): Promise<StarClassResponseDto[]> {
        return this.starClassesApiService.findPublishedStarClasses(filter, currentUserId);
    }

    // GET /api/star-classes/feed
    // GET /api/star-classes/feed?id=1
    // GET /api/star-classes/feed?id=1&next=true
    @Get("feed")
    @UseGuards(star_classes_optional_session_guard)
    @ApiOperation({
        summary: "Лента: опубликованная услуга",
        description:
            "Доступна без авторизации. Без параметров - первая услуга; ?id=N - услуга с этим id; " +
            "?id=N&next=true - следующая после N. Поле isLiked = 1, если текущий пользователь " +
            "уже лайкнул услугу (для гостя всегда 0).",
    })
    @ApiQuery({ name: "id", required: false, type: Number, example: 1 })
    @ApiQuery({ name: "next", required: false, type: Boolean, example: true })
    @ApiOkResponse({ type: StarClassResponseDto })
    @ApiNotFoundResponse({ description: "Услуга не найдена" })
    async getFeedStarClass(
        @StarClassesCurrentUserId() currentUserId: number | null,
        @Query("id") id?: string,
        @Query("next") next?: string,
    ): Promise<StarClassResponseDto> {
        return this.starClassesApiService.findFeedStarClass(
            currentUserId,
            id ? Number(id) : undefined,
            next === "true",
        );
    }

    // POST /api/star-classes (multipart/form-data: title, image, video)
    @Post()
    @UseGuards(star_classes_session_guard)
    @UseInterceptors(starClassFileUploadInterceptor)
    @ApiCookieAuth()
    @ApiOperation({
        summary: "Создание черновика с фото и видео",
        description:
            "Файлы загружаются в MinIO под сгенерированным латинским именем. Создатель берётся " +
            "из сессии. У пользователя не может быть больше одного черновика.",
    })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            required: ["title"],
            properties: {
                title: { type: "string", example: "Спектральный класс F" },
                image: { type: "string", format: "binary" },
                video: { type: "string", format: "binary" },
            },
        },
    })
    @ApiCreatedResponse({ type: StarClassResponseDto })
    @ApiConflictResponse({ description: "У пользователя уже есть черновик" })
    @ApiUnauthorizedResponse({ description: "Требуется авторизация" })
    async createDraftStarClass(
        @Body() dto: CreateStarClassDto,
        @UploadedFiles() files: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
        @StarClassesCurrentUserId() currentUserId: number,
    ): Promise<StarClassResponseDto> {
        return this.starClassesApiService.createDraftStarClass(
            dto,
            currentUserId,
            files?.image?.[0],
            files?.video?.[0],
        );
    }

    // GET /api/star-classes/draft
    @Get("draft")
    @UseGuards(star_classes_session_guard)
    @ApiCookieAuth()
    @ApiOperation({
        summary: "Получить свой черновик",
        description: "У пользователя не более одного черновика, поэтому id не указывается.",
    })
    @ApiOkResponse({ type: StarClassResponseDto })
    @ApiNotFoundResponse({ description: "Черновика нет" })
    @ApiUnauthorizedResponse({ description: "Требуется авторизация" })
    async getDraftStarClass(
        @StarClassesCurrentUserId() currentUserId: number,
    ): Promise<StarClassResponseDto> {
        return this.starClassesApiService.findDraftStarClass(currentUserId);
    }

    // PUT /api/star-classes/draft/publish
    @Put("draft/publish")
    @UseGuards(star_classes_session_guard)
    @ApiCookieAuth()
    @ApiOperation({
        summary: "Опубликовать свой черновик",
        description: "Меняет статус draft -> published и заполняет описание, массу и светимость.",
    })
    @ApiOkResponse({ type: StarClassResponseDto })
    @ApiNotFoundResponse({ description: "Черновика нет" })
    @ApiUnauthorizedResponse({ description: "Требуется авторизация" })
    async publishDraftStarClass(
        @Body() dto: PublishStarClassDto,
        @StarClassesCurrentUserId() currentUserId: number,
    ): Promise<StarClassResponseDto> {
        return this.starClassesApiService.publishDraftStarClass(dto, currentUserId);
    }

    // DELETE /api/star-classes/:id
    @Delete(":id")
    @UseGuards(star_classes_session_guard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiCookieAuth()
    @ApiOperation({
        summary: "Мягкое удаление своей услуги",
        description: "Статус меняется на deleted, запись остаётся в БД. Только услуги этого пользователя.",
    })
    @ApiParam({ name: "id", type: Number, example: 1 })
    @ApiNoContentResponse({ description: "Услуга удалена" })
    @ApiNotFoundResponse({ description: "Своей услуги с таким id нет" })
    @ApiUnauthorizedResponse({ description: "Требуется авторизация" })
    async deleteStarClass(
        @Param("id", ParseIntPipe) id: number,
        @StarClassesCurrentUserId() currentUserId: number,
    ): Promise<void> {
        await this.starClassesApiService.deleteStarClass(id, currentUserId);
    }

    // POST /api/star-classes/:id/like  (body: { "like": 0 | 1 })
    @Post(":id/like")
    @UseGuards(star_classes_session_guard)
    @ApiCookieAuth()
    @ApiOperation({
        summary: "Поставить или убрать лайк",
        description: "like = 1 ставит лайк, like = 0 отменяет. Лайк от текущего пользователя.",
    })
    @ApiParam({ name: "id", type: Number, example: 1 })
    @ApiOkResponse({ type: StarClassResponseDto })
    @ApiNotFoundResponse({ description: "Опубликованной услуги с таким id нет" })
    @ApiUnauthorizedResponse({ description: "Требуется авторизация" })
    async setStarClassLike(
        @Param("id", ParseIntPipe) id: number,
        @Body() dto: LikeStarClassDto,
        @StarClassesCurrentUserId() currentUserId: number,
    ): Promise<StarClassResponseDto> {
        return this.starClassesApiService.setStarClassLike(id, dto.like, currentUserId);
    }
}
