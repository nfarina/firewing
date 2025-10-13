import {
  FirebaseStorage,
  FullMetadata,
  StorageReference,
  UploadMetadata,
  UploadTask,
  deleteObject,
  getBlob,
  getBytes,
  getDownloadURL,
  getMetadata,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

export class WrappedStorage {
  constructor(private readonly storage: FirebaseStorage) {}

  public ref(path: string): WrappedStorageReference {
    return new WrappedStorageReference(ref(this.storage, path));
  }
}

export class WrappedStorageReference {
  constructor(private readonly ref: StorageReference) {}

  public put(
    data: Blob | Uint8Array | ArrayBuffer,
    metadata?: UploadMetadata,
  ): UploadTask {
    return uploadBytesResumable(this.ref, data, metadata);
  }

  public getDownloadURL(): Promise<string> {
    return getDownloadURL(this.ref);
  }

  public getBytes(): Promise<ArrayBuffer> {
    return getBytes(this.ref);
  }

  public getBlob(): Promise<Blob> {
    return getBlob(this.ref);
  }

  public getMetadata(): Promise<FullMetadata> {
    return getMetadata(this.ref);
  }

  public fullPath(): string {
    return this.ref.fullPath;
  }

  public delete(): Promise<void> {
    return deleteObject(this.ref);
  }
}
