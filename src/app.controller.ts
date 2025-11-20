import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ImageModel, ImageProductDetails } from './@Model/Image.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('getProducts')
  public async getProducts(): Promise<Array<ImageModel>> {
    return this.appService.provideProducts();
  }

  @Get('getImageProductList')
  public async getProductList(): Promise<Array<any>> {
    return await this.appService.provideImageProducts();
  }

  @Get('getImageProduct/:id')
  public async getProduct(
    @Param('id') id: number,
  ): Promise<ImageProductDetails> {
    return await this.appService.provideImageProductDetails(id);
  }

  @Post('postNewProduct')
  public async postNewProduct(
    @Body() body: { newProd: ImageProductDetails },
  ): Promise<{ status: string }> {
    return this.appService.saveNewImageProduct(body.newProd);
  }
}
