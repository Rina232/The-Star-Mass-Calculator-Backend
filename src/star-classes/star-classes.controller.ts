import { Controller, Get, NotFoundException, Param, Query, Render } from '@nestjs/common';
import { StarClassesService } from './star-classes.service';

@Controller()
export class StarClassesController {
  constructor(private readonly starClassesService: StarClassesService) {}

  // Лента
  @Get(['feed', 'feed/:id'])
  @Render('feed')
  getFeed(@Param('id') id?: string, @Query('next') next?: string) {
    const starClass = id
      ? next === 'true'
        ? this.starClassesService.findNextPublished(Number(id))
        : this.starClassesService.findPublishedById(Number(id))
      : this.starClassesService.findFirstPublished();

    if (!starClass) {
      throw new NotFoundException('Спектральный класс не найден');
    }

    const likeCount = this.starClassesService.getLikeCount(starClass);

    return {
      page: 'feed',
      starClass,
      imageUrl: this.starClassesService.getImageUrl(starClass),
      videoUrl: this.starClassesService.getVideoUrl(starClass),
      likeCount,
      likeCountPlusOne: likeCount + 1,
    };
  }

  // Добавление
  @Get('add')
  @Render('add')
  getDraft() {
    const starClass = this.starClassesService.findDraft();
    if (!starClass) {
      throw new NotFoundException('Черновик не найден');
    }
    return {
      page: 'add',
      starClass,
      imageUrl: this.starClassesService.getImageUrl(starClass),
      videoUrl: this.starClassesService.getVideoUrl(starClass),
    };
  }

  // Каталог
  @Get('catalog')
  @Render('catalog')
  getCatalog(@Query('min') min?: string, @Query('max') max?: string) {
    const minLuminosity = min ? Number(min) : undefined;
    const maxLuminosity = max ? Number(max) : undefined;

    const items = this.starClassesService
      .findAllPublished(minLuminosity, maxLuminosity)
      .map((starClass) => ({
        starClass,
        imageUrl: this.starClassesService.getImageUrl(starClass),
        likeCount: this.starClassesService.getLikeCount(starClass),
      }));

    return {
      page: 'catalog',
      items,
      filters: { min: min || '', max: max || '' },
    };
  }
}
