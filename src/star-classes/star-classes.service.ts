import { Injectable } from '@nestjs/common';
import { StarClass } from './interfaces/star-class.model';

const MINIO_BASE_URL = 'http://localhost:9000/media';

@Injectable()
export class StarClassesService {
  private readonly starClasses: StarClass[] = [
    {
      id: 1,
      title: 'Спектральный класс O',
      description:
        'Спектральный класс O — самые горячие, массивные и яркие звёзды главной последовательности.',
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
      description: 'Класс B — горячие голубовато-белые звёзды, немного холоднее класса O.',
      mass: 10,
      luminosity: 25000,
      imageKey: 'B-Type.jpg',
      videoKey: 'B-Type.mp4',
      status: 'published',
      likedByUserIds: [204],
    },
    {
      id: 3,
      title: 'Спектральный класс A',
      description: 'Класс A — белые звёзды с выраженными водородными линиями в спектре.',
      mass: 2.1,
      luminosity: 40,
      imageKey: 'A-Type.jpg',
      videoKey: 'A-Type.mp4',
      status: 'published',
      likedByUserIds: [],
    },
    {
      id: 4,
      title: 'Спектральный класс F',
      description: 'Класс F — жёлто-белые звёзды, чуть горячее Солнца.',
      mass: 1.3,
      luminosity: 6,
      imageKey: 'F-Type.png',
      videoKey: 'F-Type.mp4',
      status: 'published',
      likedByUserIds: [101],
    },
    {
      id: 5,
      title: 'Спектральный класс G',
      description: 'Класс G — жёлтые звёзды, к этому классу относится Солнце.',
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
      description: 'Класс K — оранжевые звёзды, холоднее Солнца.',
      mass: 0.7,
      luminosity: 0.4,
      imageKey: 'K-Type.jpg',
      videoKey: 'K-type.mp4',
      status: 'published',
      likedByUserIds: [],
    },
    {
      id: 7,
      title: 'Спектральный класс M',
      description: 'Класс M — красные карлики, самый многочисленный класс звёзд во Вселенной.',
      mass: 0.3,
      luminosity: 0.01,
      imageKey: 'M-Type.jpg',
      videoKey: 'M-Type.mp4',
      status: 'draft',
      likedByUserIds: [],
    },
    {
      id: 8,
      title: 'Спектральный класс W (устаревшая классификация)',
      description: 'Тестовая услуга для демонстрации статуса "удалён".',
      mass: 0,
      luminosity: 0,
      imageKey: 'W-Type.png',
      videoKey: '',
      status: 'deleted',
      likedByUserIds: [],
    },
  ];

  private published(): StarClass[] {
    return this.starClasses
      .filter((s) => s.status === 'published')
      .sort((a, b) => a.id - b.id);
  }

  findFirstPublished(): StarClass | undefined {
    return this.published()[0];
  }

  findPublishedById(id: number): StarClass | undefined {
    return this.published().find((s) => s.id === id);
  }

  findNextPublished(afterId: number): StarClass | undefined {
    const list = this.published();
    const index = list.findIndex((s) => s.id === afterId);
    if (index === -1) return list[0];
    return list[(index + 1) % list.length];
  }

  findDraft(): StarClass | undefined {
    return this.starClasses.find((s) => s.status === 'draft');
  }

  findAllPublished(minLuminosity?: number, maxLuminosity?: number): StarClass[] {
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

  getLikeCount(starClass: StarClass): number {
    return starClass.likedByUserIds.length;
  }

  getImageUrl(starClass: StarClass): string {
    return `${MINIO_BASE_URL}/${starClass.imageKey}`;
  }

  getVideoUrl(starClass: StarClass): string {
    return starClass.videoKey ? `${MINIO_BASE_URL}/${starClass.videoKey}` : '';
  }
}
