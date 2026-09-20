import { Injectable } from "@nestjs/common";
import { star_class } from "./interfaces/star-class.model";

const MINIO_BASE_URL = "http://localhost:9000/media";

// Юникод-символы для степени (надстрочные цифры), чтобы вывести "10⁴" как текст
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
    private readonly star_classes: star_class[] = [
        {
            id: 1,
            title: "Спектральный класс O",
            description:
                "Класс O - самые горячие и массивные звёзды с голубовато-белым цветом. Обладают огромной светимостью и высокой температурой поверхности.",
            mass: 25,
            luminosity: 80000,
            imageKey: "O-Type.png",
            videoKey: "O-Type.mp4",
            status: "published",
            likedByUserIds: [1, 2, 5, 6, 7, 32, 67, 68, 77, 89, 95, 101, 204, 305],
        },
        {
            id: 2,
            title: "Спектральный класс B",
            description:
                "Класс B - горячие голубовато-белые звёзды, уступающие классу O по температуре и массе. Отличаются высокой светимостью и относительно короткой продолжительностью жизни.",
            mass: 10,
            luminosity: 25000,
            imageKey: "B-Type.jpg",
            videoKey: "B-Type.mp4",
            status: "published",
            likedByUserIds: [5, 7, 8, 22, 23, 25, 34, 37, 45, 47, 48, 99, 190, 193, 195, 197, 201, 202, 203, 204],
        },
        {
            id: 3,
            title: "Спектральный класс A",
            description:
                "Класс A - белые звёзды с высокой температурой поверхности. В их спектрах особенно заметны линии поглощения водорода.",
            mass: 2.1,
            luminosity: 40,
            imageKey: "A-Type.jpg",
            videoKey: "A-Type.mp4",
            status: "published",
            likedByUserIds: [7, 8, 22, 23, 25, 34, 37, 45, 47, 48, 99, 190, 193],
        },
        {
            id: 4,
            title: "Спектральный класс F",
            description: "Класс F - жёлто-белые звёзды со средней температурой поверхности. Они холоднее звёзд класса A, но горячее звёзд класса G.",
            mass: 1.3,
            luminosity: 6,
            imageKey: "F-Type.png",
            videoKey: "F-Type.mp4",
            status: "published",
            likedByUserIds: [7, 8, 22, 23, 25, 34, 37, 45, 47, 48, 99, 101, 190, 193, 305, 389],
        },
        {
            id: 5,
            title: "Спектральный класс G",
            description:
                "Класс G - жёлтые звёзды умеренной температуры. К этому классу относится Солнце, поэтому он хорошо изучен астрономами.",
            mass: 1,
            luminosity: 1,
            imageKey: "G-Type.jpg",
            videoKey: "G-Type.mp4",
            status: "published",
            likedByUserIds: [45, 47, 48, 101, 204],
        },
        {
            id: 6,
            title: "Спектральный класс K",
            description: "Класс K - оранжевые звёзды, холоднее Солнца и класса G. Обычно они менее массивны и светимы, чем звёзды классов F и G.",
            mass: 0.7,
            luminosity: 0.4,
            imageKey: "K-Type.jpg",
            videoKey: "K-Type.mp4",
            status: "published",
            likedByUserIds: [34, 37, 45, 47, 48, 99, 55, 203, 296, 305, 467],
        },
        {
            id: 7,
            title: "Спектральный класс M",
            description:
                "Класс M - красные карлики, самый многочисленный класс звёзд во Вселенной.",
            mass: 0.3,
            luminosity: 0.01,
            imageKey: "M-Type.jpg",
            videoKey: "M-Type.mp4",
            status: "draft",
            likedByUserIds: [37, 45, 47, 48, 99],
        },
        {
            id: 8,
            title: "Спектральный класс W",
            description: 'Тестовая услуга для демонстрации статуса "удалён".',
            mass: 0,
            luminosity: 0,
            imageKey: "W-Type.png",
            videoKey: "",
            status: "deleted",
            likedByUserIds: [25, 34, 37, 45, 47, 48, 99, 101, 190, 193, 305, 389],
        },
    ];

    private published(): star_class[] {
        return this. star_classes
            .filter((s) => s.status === "published")
            .sort((a, b) => a.id - b.id);
    }

    findFirstPublished(): star_class | undefined {
        return this.published()[0];
    }

    findPublishedById(id: number): star_class | undefined {
        return this.published().find((s) => s.id === id);
    }

    findNextPublished(afterId: number): star_class | undefined {
        const list = this.published();
        const index = list.findIndex((s) => s.id === afterId);
        if (index === -1) return list[0];
        return list[(index + 1) % list.length];
    }

    findDraft(): star_class | undefined {
        return this. star_classes.find((s) => s.status === "draft");
    }

    findAllPublished(
        minMass?: number,
        maxMass?: number,
    ): star_class[] {
        return this.published().filter((s) => {
            if (
                minMass !== undefined &&
                !Number.isNaN(minMass) &&
                s.mass < minMass
            ) {
                return false;
            }
            if (
                maxMass !== undefined &&
                !Number.isNaN(maxMass) &&
                s.mass > maxMass
            ) {
                return false;
            }
            return true;
        });
    }

    getLikeCount(star_class: star_class): number {
        return star_class.likedByUserIds.length;
    }

    getImageUrl(star_class: star_class): string {
        return `${MINIO_BASE_URL}/${star_class.imageKey}`;
    }

    getVideoUrl(star_class: star_class): string {
        return star_class.videoKey
            ? `${MINIO_BASE_URL}/${star_class.videoKey}`
            : "";
    }

    formatAstroNumber(value: number): string {
        if (!value) {
            return "0";
        }

        const integerDigitsCount = Math.floor(Math.abs(value))
            .toString()
            .length;

        if (integerDigitsCount <= 3) {
            return Number(value.toFixed(2)).toString();
        }

        const exponent = Math.floor(Math.log10(Math.abs(value)));
        const mantissa = Number((value / 10 ** exponent).toFixed(1));

        return `${mantissa}×10${toSuperscript(exponent)}`;
    }
}
