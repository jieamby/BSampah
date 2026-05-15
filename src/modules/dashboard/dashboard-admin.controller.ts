import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DashboardAdminService } from './dashboard-admin.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { GenerateReportDto } from './dto/generate-report.dto';

@ApiTags('Dashboard (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/dashboard')
export class DashboardAdminController {
  constructor(private readonly adminService: DashboardAdminService) {}

  @ApiOperation({ summary: 'Overview Dashboard' })
  @Get('overview')
  getOverview(@Query() query: DashboardQueryDto) {
    return this.adminService.getOverview(query);
  }

  @ApiOperation({ summary: 'Ringkasan per Jenis Sampah' })
  @Get('waste-summary')
  getWasteSummary(@Query() query: DashboardQueryDto) {
    return this.adminService.getWasteSummary(query);
  }

  @ApiOperation({ summary: 'Ringkasan per Customer (Top Depositor)' })
  @Get('customer-summary')
  getCustomerSummary(@Query() query: DashboardQueryDto) {
    return this.adminService.getCustomerSummary(query);
  }

  @ApiOperation({ summary: 'Ringkasan per Kategori' })
  @Get('category-summary')
  getCategorySummary(@Query() query: DashboardQueryDto) {
    return this.adminService.getCategorySummary(query);
  }

  @ApiOperation({ summary: 'Trend Bulanan' })
  @Get('monthly-trend')
  getMonthlyTrend(@Query() query: DashboardQueryDto) {
    return this.adminService.getMonthlyTrend(query);
  }

  @ApiOperation({ summary: 'Status Deposit (Pie Chart)' })
  @Get('deposit-status')
  getDepositStatus(@Query() query: DashboardQueryDto) {
    return this.adminService.getDepositStatusSummary(query);
  }

  @ApiOperation({ summary: 'Generate & Simpan Laporan' })
  @Post('generate-report')
  generateReport(@Body() dto: GenerateReportDto) {
    return this.adminService.generateReport(dto);
  }
}