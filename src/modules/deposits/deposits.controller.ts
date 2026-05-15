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
  create(@Body() dto: CreateDepositDto) {
    return this.depositsService.create(dto);
  }

  @ApiOperation({ summary: 'Get All Deposits' })
  @Get()
  findAll() {
    return this.depositsService.findAll();
  }

  @ApiOperation({ summary: 'Get Deposit Detail' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.depositsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Deposit Status' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepositDto,
  ) {
    return this.depositsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Cancel Deposit' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.depositsService.remove(id);
  }
}