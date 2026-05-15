import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateDepositDto {
  @ApiPropertyOptional({ example: 'completed', enum: ['pending', 'completed', 'cancelled'] })
  @IsString()
  @IsOptional()
  @IsIn(['pending', 'completed', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({ example: 'Deposit sudah diverifikasi' })
  @IsString()
  @IsOptional()
  notes?: string;
}