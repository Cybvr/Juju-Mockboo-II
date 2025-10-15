
export interface Gallery {
  id: string;
  userId: string;
  title: string;
  type: string;
  prompt?: string;
  images: string[];
  createdAt: number;
  updatedAt: number;
}
