import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntity {
  @ApiProperty({ description: 'ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({
    type: 'timestamp',
    comment: '创建时间',
  })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({
    type: 'timestamp',
    comment: '更新时间',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    comment: '删除时间',
  })
  deletedAt?: Date;
}
