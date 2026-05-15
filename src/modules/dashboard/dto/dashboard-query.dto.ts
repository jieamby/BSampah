import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class DashboardQueryDto {
  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'daily',
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
  })
  @IsOptional()
  @IsString()
  @IsEnum(['daily', 'weekly', 'monthly', 'yearly'])
  period?: string;
}

export class GenerateReportDto {
  @ApiPropertyOptional({
    example: 'daily',
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
  })
  @IsOptional()
  @IsString()
  reportType?: string;
}
