import { IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'Budi Santoso',
  })
  @IsString()
  fullName!: string;

  @ApiProperty({
    example: '08123456789',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    example: 'Bandung',
  })
  @IsOptional()
  @IsString()
  address?: string;
}
