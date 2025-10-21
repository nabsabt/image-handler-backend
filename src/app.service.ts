import { Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Mongoose } from 'mongoose';
import { Bucket } from '@google-cloud/storage';

@Injectable()
export class AppService {
  constructor(
    @InjectConnection() private mongo: Connection,
    @Inject('FIREBASE_BUCKET') private bucket: Bucket,
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
      })
      .toArray();
    return prods;
  }

  public async provideImageProductDetails(id: number): Promise<any> {}
}
