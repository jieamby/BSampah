import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @ApiOperation({ summary: 'Create Customer' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string' },
        phoneNumber: { type: 'string' },
        address: { type: 'string' },
        photo: { type: 'string', format: 'binary' },
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
    @Body() dto: CreateCustomerDto,
    @Request() req: any,
  ) {
    return this.customersService.create(dto, file, req.user.companyId);
  }

  @ApiOperation({ summary: 'Get All Customers' })
  @Get()
  findAll(@Request() req: any) {
    return this.customersService.findAll(req.user.companyId);
  }

  @ApiOperation({ summary: 'Get Customer Detail' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.customersService.findOne(id, req.user.companyId);
  }

  @ApiOperation({ summary: 'Update Customer' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @Request() req: any,
  ) {
    return this.customersService.update(id, dto, req.user.companyId);
  }

  @ApiOperation({ summary: 'Delete Customer' })
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.customersService.remove(id, req.user.companyId);
  }
}
