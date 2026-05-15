import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateTransactionDto {
  @ApiPropertyOptional({ example: 'completed', enum: ['completed', 'cancelled'] })
  @IsString()
  @IsOptional()
  @IsIn(['completed', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({ example: 'Catatan update' })
  @IsString()
  @IsOptional()
  notes?: string;
}