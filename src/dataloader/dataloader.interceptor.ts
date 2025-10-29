import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { DataLoaderService } from './dataloader.service';

@Injectable()
export class DataLoaderInterceptor implements NestInterceptor {
  constructor(private readonly dataLoaderService: DataLoaderService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context).getContext();

    if (!ctx.loaders) {
      ctx.loaders = this.dataLoaderService.createLoaders();
    }

    return next.handle();
  }
}
