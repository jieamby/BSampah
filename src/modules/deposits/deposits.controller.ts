import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DepositsService } from './deposits.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';

@ApiTags('Deposits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @ApiOperation({ summary: 'Create Deposit' })
  @Post()
  create(@Body() dto: CreateDepositDto, @Request() req: any) {
    return this.depositsService.create(dto, req.user.companyId);
  }

  @ApiOperation({ summary: 'Get All Deposits' })
  @Get()
  findAll(@Request() req: any) {
    return this.depositsService.findAll(req.user.companyId);
  }

  @ApiOperation({ summary: 'Get Deposit Detail' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.depositsService.findOne(id, req.user.companyId);
  }

  @ApiOperation({ summary: 'Update Deposit Status' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepositDto,
    @Request() req: any,
  ) {
    return this.depositsService.update(id, dto, req.user.companyId);
  }

  @ApiOperation({ summary: 'Cancel Deposit' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.depositsService.remove(id, req.user.companyId);
  }
}
