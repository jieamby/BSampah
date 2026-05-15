import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'Admin',
  })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'admin@mail.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123456',
    minLength: 6,
  })
  @MinLength(6)
  password!: string;
}
