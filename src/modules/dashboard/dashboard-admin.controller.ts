import {
  Controller, Get, Post, Query, Body, UseGuards, Request,
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
  getOverview(@Query() query: DashboardQueryDto, @Request() req: any) {
    return this.adminService.getOverview(req.user.companyId, query);
  }

  @ApiOperation({ summary: 'Ringkasan per Jenis Sampah' })
  @Get('waste-summary')
  getWasteSummary(@Query() query: DashboardQueryDto, @Request() req: any) {
    return this.adminService.getWasteSummary(req.user.companyId, query);
  }

  @ApiOperation({ summary: 'Ringkasan per Customer (Top Depositor)' })
  @Get('customer-summary')
  getCustomerSummary(@Query() query: DashboardQueryDto, @Request() req: any) {
    return this.adminService.getCustomerSummary(req.user.companyId, query);
  }

  @ApiOperation({ summary: 'Ringkasan per Kategori' })
  @Get('category-summary')
  getCategorySummary(@Query() query: DashboardQueryDto, @Request() req: any) {
    return this.adminService.getCategorySummary(req.user.companyId, query);
  }

  @ApiOperation({ summary: 'Trend Bulanan' })
  @Get('monthly-trend')
  getMonthlyTrend(@Query() query: DashboardQueryDto, @Request() req: any) {
    return this.adminService.getMonthlyTrend(req.user.companyId, query);
  }

  @ApiOperation({ summary: 'Status Deposit (Pie Chart)' })
  @Get('deposit-status')
  getDepositStatus(@Query() query: DashboardQueryDto, @Request() req: any) {
    return this.adminService.getDepositStatusSummary(req.user.companyId, query);
  }

  @ApiOperation({ summary: 'Generate & Simpan Laporan' })
  @Post('generate-report')
  generateReport(@Body() dto: GenerateReportDto, @Request() req: any) {
    return this.adminService.generateReport(req.user.companyId, dto);
  }
}