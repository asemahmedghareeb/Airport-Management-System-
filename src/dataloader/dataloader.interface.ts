// src/dataloader/dataloader.interface.ts
import DataLoader from 'dataloader';

export interface IDataLoaders {
  [key: string]: DataLoader<any, any>;
}

export interface IDataLoaderService {
  createLoaders(): IDataLoaders;
}