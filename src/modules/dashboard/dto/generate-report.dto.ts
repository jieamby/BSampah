import { PartialType } from '@nestjs/swagger';
import { DashboardQueryDto } from './dashboard-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class GenerateReportDto extends PartialType(DashboardQueryDto) {
  @ApiPropertyOptional({
    example: 'daily',
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
  })
  @IsOptional()
  @IsString()
  @IsEnum(['daily', 'weekly', 'monthly', 'yearly', 'custom'])
  reportType?: string;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsString()
  endDate?: string;
}
