import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
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
        //uri: configService.get<string>('MONGODB_CONNECTION'),
        uri: configService.get<string>(
          process.env.NODE_ENV === 'production'
            ? 'MONGODB_CONNECTION_PROD'
            : 'MONGODB_CONNECTION_DEV',
        ),
      }),
    }),
  ],
  controllers: [AppController, FileUploadController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
