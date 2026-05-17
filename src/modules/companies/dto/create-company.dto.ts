import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Bank Sampah Sejahtera' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'bank-sampah-sejahtera' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: 'info@banksampah.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '08123456789', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Jl. Merdeka No. 1', required: false })
  @IsString()
  @IsOptional()
  address?: string;
}
