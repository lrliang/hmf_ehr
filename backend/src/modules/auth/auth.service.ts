import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await user.validatePassword(password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        realName: user.realName,
        roles: user.roles,
      },
    };
  }

  async validateToken(payload: any): Promise<User> {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return user;
  }
}
