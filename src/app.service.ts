import { Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Mongoose } from 'mongoose';
import { Bucket } from '@google-cloud/storage';
import { ImageProductDetails } from './@Model/Image.model';

@Injectable()
export class AppService {
  constructor(
    @InjectConnection() private mongo: Connection,
    /* @Inject('FIREBASE_BUCKET') private bucket: Bucket, */
  ) {}

  private productsCollection = this.mongo.collection('products');
  private imageProductsCollection = this.mongo.collection('imageproducts');
  private mongoose = new Mongoose();

  public async provideProducts(): Promise<any> {
    const res = await this.productsCollection.find({}).toArray();
    return res;
  }

  public async provideImageProducts(): Promise<any> {
    const prods = await this.imageProductsCollection
      .find({})
      .project({
        productID: 1,
        productThumbnailImage: 1,
        productName: 1,
        defaultPrice: 1,
        productImages: 1,
      })
      .toArray();
    return prods;
  }

  public async provideImageProductDetails(id: number): Promise<any> {
    const prod = await this.imageProductsCollection.findOne({
      productID: parseInt(id as any),
    });
    return prod;
  }

  public async saveNewImageProduct(
    newProd: ImageProductDetails,
  ): Promise<{ status: string }> {
    const insertedProduct =
      await this.imageProductsCollection.insertOne(newProd);

    if (insertedProduct.insertedId) {
      return { status: 'Successfully inserted' };
    } else {
      return { status: 'Error' };
    }
  }
}
