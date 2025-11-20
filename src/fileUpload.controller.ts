import {
  Body,
  Controller,
  Logger,
  NotImplementedException,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { initializeApp } from 'firebase/app';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

@Controller('fileService')
export class FileUploadController {
  constructor(private configService: ConfigService) {}

  @Post('old_uploadFiles')
  @UseInterceptors(FilesInterceptor('files'))
  public async old_postUploadFiles(
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
          /**
           * upload small thumbnail img seperately->
           */
          sharp(files[i].buffer)
            .resize({ width: 100, height: 100 })
            .jpeg()
            .toBuffer()
            .then(async (data) => {
              const thumbnailFileRef = ref(
                fireBaseStorage,
                `${folderPath}/thumbnail_${files[i].originalname}`,
              );
              const thumbnailSnapshot = await uploadBytes(
                thumbnailFileRef,
                data,
                {
                  contentType: files[i].mimetype,
                },
              );
              thumbnailURL = await getDownloadURL(thumbnailSnapshot.ref);
            })
            .catch((err) => Logger.log('thumbnail crop&upload failed: ', err));
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

  @Post('uploadFiles')
  @UseInterceptors(FilesInterceptor('files'))
  public async _postUploadFiles(
    @Body('folderPath') folderPath: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<{ thumbnailURL: string; imageURLs: string[] }> {
    try {
      const serverUrl =
        this.configService.get<string>('SERVER_URL') || 'http://localhost';

      const baseUploadPath = path.join(process.cwd(), folderPath); // app/uploads
      console.log('baseUploadPath: ', baseUploadPath);

      // Create the directory if it doesn’t exist
      fs.mkdirSync(baseUploadPath, { recursive: true });

      const imageURLs: string[] = [];
      let thumbnailURL = '';

      for (let i = 0; i < files.length; i++) {
        const filePath = path.join(baseUploadPath, files[i].originalname);
        fs.writeFileSync(filePath, files[i].buffer);

        // Save first image's thumbnail
        if (i === 0) {
          const thumbPath = path.join(
            baseUploadPath,
            `thumbnail_${files[i].originalname}`,
          );

          await sharp(files[i].buffer)
            .resize({ width: 100, height: 100 })
            .jpeg()
            .toFile(thumbPath);

          thumbnailURL = `${serverUrl}/${folderPath}/thumbnail_${files[i].originalname}`;
        }

        imageURLs.push(`${serverUrl}/${folderPath}/${files[i].originalname}`);
      }

      console.log('thumbnail uploaded to: ', thumbnailURL);

      return { thumbnailURL, imageURLs };
    } catch (err) {
      Logger.error('File upload failed:', err);
      throw new NotImplementedException('Could not upload files!');
    }
  }
}
