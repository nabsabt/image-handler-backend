export interface ImageModel {
  generatedID: number;
  imageURL: string;
  modelColor: string;
  modelName: string;
  modelType: string;
  modelDesc: string;
}

export interface ImageProductDetails {
  productID: number;
  productImages: string[];
  productThumbnailImage: string;
  defaultPrice: number;
  productDescription: string;
  productName: string;
}
