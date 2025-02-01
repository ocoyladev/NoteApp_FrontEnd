export interface Note {
  id: string;
  title: string;
  content: string;
  tags: Tag[];
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  email: string;
  id: string;
}

export interface Tag {
  id: string;
  name: string;
}