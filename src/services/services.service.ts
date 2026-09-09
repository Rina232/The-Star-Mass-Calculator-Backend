import { Injectable } from '@nestjs/common';
import { StarService } from './interfaces/service.model';

const MINIO_BASE_URL = 'http://localhost:9000/media';

@Injectable()
export class ServicesService {
  private readonly services: StarService[] = [
    {
      id: 1,
      title: 'Спектральный класс O',
      description:
        'Спектральный класс O - самые горячие, массивные и яркие звёзды главной последовательности.',
      mass: 25,
      luminosity: 80000,
      imageKey: 'O-Type.png',
      videoKey: 'O-Type.mp4',
      status: 'published',
      likedByUserIds: [101, 204, 305],
    },
    {
      id: 2,
      title: 'Спектральный класс B',
      description: 'Класс B - горячие голубовато-белые звёзды, немного холоднее класса O.',
      mass: 15,
      luminosity: 10000,
      imageKey: 'B-Type.jpg',
      videoKey: 'B-Type.mp4',
      status: 'published',
      likedByUserIds: [204],
    },
    {
      id: 3,
      title: 'Спектральный класс A',
      description: 'Класс A - белые звёзды с выраженными водородными линиями в спектре.',
      mass: 3,
      luminosity: 60,
      imageKey: 'A-Type.jpg',
      videoKey: 'A-Type.mp4',
      status: 'published',
      likedByUserIds: [],
    },
    {
      id: 4,
      title: 'Спектральный класс F',
      description: 'Класс F - жёлто-белые звёзды, чуть горячее Солнца.',
      mass: 1.5,
      luminosity: 5,
      imageKey: 'F-Type.png',
      videoKey: 'F-Type.mp4',
      status: 'published',
      likedByUserIds: [101],
    },
    {
      id: 5,
      title: 'Спектральный класс G',
      description: 'Класс G - жёлтые звёзды, к этому классу относится Солнце.',
      mass: 1,
      luminosity: 1,
      imageKey: 'G-Type.jpg',
      videoKey: 'G-Type.mp4',
      status: 'published',
      likedByUserIds: [101, 204],
    },
    {
      id: 6,
      title: 'Спектральный класс K',
      description: 'Класс K - оранжевые звёзды, холоднее Солнца.',
      mass: 0.75,
      luminosity: 0.5,
      imageKey: 'K-Type.jpg',
      videoKey: 'K-Type.mp4',
      status: 'published',
      likedByUserIds: [],
    },
    {
      id: 7,
      title: 'Спектральный класс M',
      description: 'Класс M - красные карлики, самый многочисленный класс звёзд во Вселенной.',
      mass: 0.5,
      luminosity: 0.03,
      imageKey: 'M-Type.jpg',
      videoKey: 'M-Type.mp4',
      status: 'draft',
      likedByUserIds: [],
    },
    {
      id: 8,
      title: 'Спектральный класс W',
      description: 'Спектральный класс W - редкий класс горячих звёзд Вольфа—Райе с сильными эмиссионными линиями в спектре.',
      mass: 15,
      luminosity: 300000,
      imageKey: 'W-Type.jpg',
      videoKey: '',
      status: 'deleted',
      likedByUserIds: [],
    },
  ];

  private published(): StarService[] {
    return this.services
      .filter((s) => s.status === 'published')
      .sort((a, b) => a.id - b.id);
  }

  findFirstPublished(): StarService | undefined {
    return this.published()[0];
  }

  findPublishedById(id: number): StarService | undefined {
    return this.published().find((s) => s.id === id);
  }

  findNextPublished(afterId: number): StarService | undefined {
    const list = this.published();
    const index = list.findIndex((s) => s.id === afterId);
    if (index === -1) return list[0];
    return list[(index + 1) % list.length];
  }

  findDraft(): StarService | undefined {
    return this.services.find((s) => s.status === 'draft');
  }

  findAllPublished(minLuminosity?: number, maxLuminosity?: number): StarService[] {
    return this.published().filter((s) => {
      if (minLuminosity !== undefined && !Number.isNaN(minLuminosity) && s.luminosity < minLuminosity) {
        return false;
      }
      if (maxLuminosity !== undefined && !Number.isNaN(maxLuminosity) && s.luminosity > maxLuminosity) {
        return false;
      }
      return true;
    });
  }

  getLikeCount(service: StarService): number {
    return service.likedByUserIds.length;
  }

  getImageUrl(service: StarService): string {
    return `${MINIO_BASE_URL}/${service.imageKey}`;
  }

  getVideoUrl(service: StarService): string {
    return service.videoKey ? `${MINIO_BASE_URL}/${service.videoKey}` : '';
  }
}
