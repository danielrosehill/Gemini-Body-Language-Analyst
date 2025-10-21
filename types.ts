
export interface Tag {
  x: number;
  y: number;
  name: string;
}

export interface TaggedImage {
  id: string;
  file: File;
  base64: string;
  tags: Tag[];
}
