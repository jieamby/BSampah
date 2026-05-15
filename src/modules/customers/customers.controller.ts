import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CustomersService } from './customers.service';

import { CreateCustomerDto } from './dto/create-customer.dto';

import { UpdateCustomerDto } from './dto/update-customer.dto';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { FileInterceptor } from '@nestjs/platform-express';

import { UploadedFile, UseInterceptors } from '@nestjs/common';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @ApiOperation({
    summary: 'Create Customer',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: {
          type: 'string',
        },
        phoneNumber: {
          type: 'string',
        },
        address: {
          type: 'string',
        },
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  @Post()
  create(
    @UploadedFile() file: Express.Multer.File,

    @Body()
    dto: CreateCustomerDto,
  ) {
    return this.customersService.create(dto, file);
  }

  @ApiOperation({
    summary: 'Get All Customers',
  })
  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @ApiOperation({
    summary: 'Get Customer Detail',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update Customer',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,

    @Body()
    dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Delete Customer',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
