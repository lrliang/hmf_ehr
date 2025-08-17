import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '用户名' })
  @IsString({ message: '用户名必须是字符串' })
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少6个字符' })
  password: string;
}
