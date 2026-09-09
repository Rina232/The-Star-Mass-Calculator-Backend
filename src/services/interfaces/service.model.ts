export type ServiceStatus = 'draft' | 'published' | 'deleted';


export interface StarService {
  id: number;
  title: string;
  description: string;
  mass: number;
  luminosity: number;
  imageKey: string;
  videoKey: string;
  status: ServiceStatus;
  likedByUserIds: number[];
}
