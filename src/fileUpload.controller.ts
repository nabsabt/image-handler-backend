import {
  Body,
  Controller,
  NotImplementedException,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { initializeApp } from 'firebase/app';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

@Controller('fileService')
export class FileUploadController {
  constructor(private configService: ConfigService) {}

  @Post('uploadFiles')
  @UseInterceptors(FilesInterceptor('files'))
  public async postUploadFiles(
    @Body('folderPath') folderPath: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<{ thumbnailURL: string; imageURLs: string[] }> {
    const credentials = JSON.parse(
      this.configService.get<string>('FIREBASE_CONFIG'),
    );
    const firebaseApp = initializeApp(credentials);
    const fireBaseStorage = getStorage(firebaseApp);
    let thumbnailURL: string = '';
    const imageURLs: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const fileRef = ref(
        fireBaseStorage,
        `${folderPath}/${files[i].originalname}`,
      );
      try {
        /**
         * buffer contains the actual binary data (which a simple File would be)
         */
        const snapshot = await uploadBytes(fileRef, files[i].buffer, {
          contentType: files[i].mimetype,
        });
        // Get the public URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        /**
         * Assign first image's URL to the thumbnail URL->
         */
        if (i === 0) {
          thumbnailURL = downloadURL;
        }
        imageURLs.push(downloadURL);
      } catch (error) {
        throw new NotImplementedException(
          'Could not upload images to Firebase!',
        );
      }
    }

    return { thumbnailURL, imageURLs };
  }
}
