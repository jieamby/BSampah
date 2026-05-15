import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DashboardStaffService } from './dashboard-staff.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@ApiTags('Dashboard (Petugas)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'staff')
@Controller('staff/dashboard')
export class DashboardStaffController {
  constructor(private readonly staffService: DashboardStaffService) {}

  @ApiOperation({ summary: 'Overview Petugas' })
  @Get('overview')
  getOverview(@Query() query: DashboardQueryDto) {
    return this.staffService.getOverview(query);
  }

  @ApiOperation({ summary: 'Transaksi Hari Ini' })
  @Get('today-transactions')
  getTodayTransactions(@Query() query: DashboardQueryDto) {
    return this.staffService.getTodayTransactions(query);
  }

  @ApiOperation({ summary: 'Ringkasan per Jenis Sampah' })
  @Get('waste-summary')
  getWasteSummary(@Query() query: DashboardQueryDto) {
    return this.staffService.getWasteSummary(query);
  }

  @ApiOperation({ summary: 'Ringkasan per Kategori' })
  @Get('category-summary')
  getCategorySummary(@Query() query: DashboardQueryDto) {
    return this.staffService.getCategorySummary(query);
  }

  @ApiOperation({ summary: 'Trend Bulanan' })
  @Get('monthly-trend')
  getMonthlyTrend(@Query() query: DashboardQueryDto) {
    return this.staffService.getMonthlyTrend(query);
  }
}