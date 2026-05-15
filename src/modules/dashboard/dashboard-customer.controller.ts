import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DashboardCustomerService } from './dashboard-customer.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@ApiTags('Dashboard (Customer)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customer/dashboard')
export class DashboardCustomerController {
  constructor(
    private readonly customerService: DashboardCustomerService,
  ) {}

  // Ambil customerId dari JWT token (user.id)
  @ApiOperation({ summary: 'Profile & Saldo Customer' })
  @Get('profile')
  getProfile(
    @Query('customerId', ParseUUIDPipe) customerId: string,
  ) {
    return this.customerService.getProfile(customerId);
  }

  @ApiOperation({ summary: 'Riwayat Deposit' })
  @Get('deposits')
  getMyDeposits(
    @Query('customerId', ParseUUIDPipe) customerId: string,
    @Query() query: DashboardQueryDto,
  ) {
    return this.customerService.getMyDeposits(customerId, query);
  }

  @ApiOperation({ summary: 'Riwayat Transaksi' })
  @Get('transactions')
  getMyTransactions(
    @Query('customerId', ParseUUIDPipe) customerId: string,
    @Query() query: DashboardQueryDto,
  ) {
    return this.customerService.getMyTransactions(customerId, query);
  }

  @ApiOperation({ summary: 'Ringkasan per Jenis Sampah' })
  @Get('waste-summary')
  getMyWasteSummary(
    @Query('customerId', ParseUUIDPipe) customerId: string,
    @Query() query: DashboardQueryDto,
  ) {
    return this.customerService.getMyWasteSummary(customerId, query);
  }
}