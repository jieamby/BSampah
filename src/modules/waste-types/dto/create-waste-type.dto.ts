import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateWasteTypeDto {
  @ApiProperty({ example: 'Plastik' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({ example: 'Sampah plastik botol, kemasan, dll' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 3000 })
  @IsNumber()
  @Min(0)
  pricePerKg!: number;

  @ApiPropertyOptional({ example: 'kg' })
  @IsString()
  @IsOptional()
  unit?: string;
}
