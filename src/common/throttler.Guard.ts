import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('🚀 GqlThrottlerGuard triggered!');
    return super.canActivate(context);
  }

  getRequestResponse(context: ExecutionContext) {
    if (context.getType<'graphql'>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext<{ req: any; res: any }>();
      return { req: ctx.req, res: ctx.res };
    }
    const httpCtx = context.switchToHttp();
    return { req: httpCtx.getRequest(), res: httpCtx.getResponse() };
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const ip =
      req?.ip ||
      req?.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req?.connection?.remoteAddress ||
      'unknown';
    console.log('📊 Tracking IP:', ip);
    return ip;
  }
}
