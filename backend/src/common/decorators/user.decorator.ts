import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserPayload {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext): UserPayload | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
