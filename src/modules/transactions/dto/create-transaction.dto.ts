import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionItemDto {
  @ApiProperty({ example: 'uuid-waste-type' })
  @IsUUID()
  @IsNotEmpty()
  wasteTypeId!: string;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(0.01)
  weight!: number;
}

export class CreateTransactionDto {
  @ApiProperty({ description: 'Barcode atau UUID customer' })
  @IsString()
  @IsNotEmpty()
  barcode!: string;

  @ApiPropertyOptional({ example: 'Setor sampah plastik dan kertas' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    type: [TransactionItemDto],
    example: [
      { wasteTypeId: 'uuid-plastik', weight: 2.5 },
      { wasteTypeId: 'uuid-kertas', weight: 1.0 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  items!: TransactionItemDto[];
}
