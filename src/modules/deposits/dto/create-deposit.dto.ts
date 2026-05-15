import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DepositItemDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  wasteTypeId!: string;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(0.01)
  weight!: number;
}

export class CreateDepositDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  customerId!: string;

  @ApiPropertyOptional({ example: 'Deposit plastik dan kertas' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    type: [DepositItemDto],
    example: [
      { wasteTypeId: '550e8400-e29b-41d4-a716-446655440000', weight: 2.5 },
      { wasteTypeId: '660e8400-e29b-41d4-a716-446655440000', weight: 1.0 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepositItemDto)
  items!: DepositItemDto[];
}
