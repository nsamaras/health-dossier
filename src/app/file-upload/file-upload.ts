export class FileUpload {
    id: string;
    key: string;
    name: string;
    url: string;
    file: File;
    subCategory: number;
    urid: string;
    category: string;
    expiryDate?: Date;

    constructor(file: File) {
      this.file = file;
    }
  }