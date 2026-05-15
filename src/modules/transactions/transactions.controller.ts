import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Scan Barcode - Get Customer' })
  @Get('scan/:barcode')
  scanBarcode(@Param('barcode') barcode: string) {
    return this.transactionsService.scanBarcode(barcode);
  }

  @ApiOperation({ summary: 'Create Transaction (auto-create deposit)' })
  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @ApiOperation({ summary: 'Get All Transactions' })
  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @ApiOperation({ summary: 'Get Transaction Detail' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.findOne(id);
  }

  @ApiOperation({ summary: 'Get Transactions by Customer' })
  @Get('customer/:customerId')
  findByCustomer(@Param('customerId', ParseUUIDPipe) customerId: string) {
    return this.transactionsService.findByCustomer(customerId);
  }

  // @ApiOperation({ summary: 'Update Transaction (cancel will also cancel deposit)' })
  // @Patch(':id')
  // update(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body() dto: UpdateTransactionDto,
  // ) {
  //   return this.transactionsService.update(id, dto);
  // }
}
