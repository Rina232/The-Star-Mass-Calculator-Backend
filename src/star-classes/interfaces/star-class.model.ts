export type StarClassStatus = 'draft' | 'published' | 'deleted';

export interface StarClass {
  id: number;
  title: string;
  description: string;
  mass: number;
  luminosity: number;
  imageKey: string;
  videoKey: string;
  status: StarClassStatus;
  likedByUserIds: number[];
}
