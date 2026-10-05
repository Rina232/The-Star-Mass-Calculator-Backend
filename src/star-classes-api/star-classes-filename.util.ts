const CYRILLIC_TO_LATIN: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function transliterateStarClassText(text: string): string {
    return text
        .toLowerCase()
        .split("")
        .map((character) => CYRILLIC_TO_LATIN[character] ?? character)
        .join("");
}

export function generateStarClassFileName(originalFileName: string, titleHint: string): string {
    const extension = originalFileName.includes(".")
        ? originalFileName.split(".").pop()
        : undefined;

    const slug = transliterateStarClassText(titleHint)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "star-class";

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
    const nameWithoutExtension = `${slug}-${uniqueSuffix}`;

    return extension ? `${nameWithoutExtension}.${extension}` : nameWithoutExtension;
}
