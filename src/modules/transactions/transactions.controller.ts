import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Scan Barcode - Get Customer' })
  @Get('scan/:barcode')
  scanBarcode(@Param('barcode') barcode: string, @Request() req: any) {
    return this.transactionsService.scanBarcode(barcode, req.user.companyId);
  }

  @ApiOperation({ summary: 'Create Transaction' })
  @Post()
  create(@Body() dto: CreateTransactionDto, @Request() req: any) {
    return this.transactionsService.create(dto, req.user.companyId);
  }

  @ApiOperation({ summary: 'Get All Transactions' })
  @Get()
  findAll(@Request() req: any) {
    return this.transactionsService.findAll(req.user.companyId);
  }

  @ApiOperation({ summary: 'Get Transaction Detail' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.transactionsService.findOne(id, req.user.companyId);
  }

  @ApiOperation({ summary: 'Get Transactions by Customer' })
  @Get('customer/:customerId')
  findByCustomer(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Request() req: any,
  ) {
    return this.transactionsService.findByCustomer(
      customerId,
      req.user.companyId,
    );
  }
}
