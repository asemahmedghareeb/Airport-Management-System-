// src/common/interfaces/graphql-context.interface.ts
import { IDataLoaders } from '../../dataloader/dataloader.interface';

export interface IGraphQLContext {
  loaders: IDataLoaders;
}