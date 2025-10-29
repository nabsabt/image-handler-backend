import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import * as admin from 'firebase-admin';
import { FileUploadController } from './fileUpload.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '../.env'),
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_CONNECTION'),
      }),
    }),
  ],
  controllers: [AppController, FileUploadController],
  providers: [
    AppService,
    /* {
      provide: 'FIREBASE_BUCKET',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const credentials = JSON.parse(
          config.get<string>('FIREBASE_CREDENTIALS'),
        );

        const app = admin.initializeApp({
          credential: admin.credential.cert(credentials),
          storageBucket: 'gorsium-app.firebasestorage.app',
        });

        return admin.storage().bucket();
      },
    }, */
  ],
  exports: [
    /* 'FIREBASE_BUCKET' */
  ],
})
export class AppModule {}
