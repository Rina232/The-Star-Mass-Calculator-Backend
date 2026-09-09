import { Controller, Get, NotFoundException, Param, Query, Render } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get(['feed', 'feed/:id'])
  @Render('feed')
  getFeed(@Param('id') id?: string, @Query('next') next?: string) {
    let service = id
      ? next === 'true'
        ? this.servicesService.findNextPublished(Number(id))
        : this.servicesService.findPublishedById(Number(id))
      : this.servicesService.findFirstPublished();

    if (!service) {
      throw new NotFoundException('Услуга не найдена');
    }

    const likeCount = this.servicesService.getLikeCount(service);

    return {
      page: 'feed',
      service,
      imageUrl: this.servicesService.getImageUrl(service),
      videoUrl: this.servicesService.getVideoUrl(service),
      likeCount,
      likeCountPlusOne: likeCount + 1,
    };
  }

  @Get('add')
  @Render('add')
  getDraft() {
    const service = this.servicesService.findDraft();
    if (!service) {
      throw new NotFoundException('Черновик не найден');
    }
    return {
      page: 'add',
      service,
      imageUrl: this.servicesService.getImageUrl(service),
      videoUrl: this.servicesService.getVideoUrl(service),
    };
  }

  @Get('catalog')
  @Render('catalog')
  getCatalog(@Query('min') min?: string, @Query('max') max?: string) {
    const minLuminosity = min ? Number(min) : undefined;
    const maxLuminosity = max ? Number(max) : undefined;

    const items = this.servicesService
      .findAllPublished(minLuminosity, maxLuminosity)
      .map((service) => ({
        service,
        imageUrl: this.servicesService.getImageUrl(service),
        likeCount: this.servicesService.getLikeCount(service),
      }));

    return {
      page: 'catalog',
      items,
      filters: { min: min || '', max: max || '' },
    };
  }
}
