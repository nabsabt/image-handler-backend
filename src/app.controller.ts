import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ImageModel } from './@Model/Image.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('getProducts')
  public async getProducts(): Promise<Array<ImageModel>> {
    return this.appService.provideProducts();
  }

  @Get('getImageProductList')
  public async getProductList(): Promise<Array<ImageModel>> {
    return await this.appService.provideImageProducts();
  }

  @Get('getImageProduct/:id')
  public async getProduct(@Param('id') id: number): Promise<Array<ImageModel>> {
    return this.appService.provideImageProductDetails(id);
  }
}
