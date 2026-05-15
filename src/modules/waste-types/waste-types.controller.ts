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
import { WasteTypesService } from './waste-types.service';
import { CreateWasteTypeDto } from './dto/create-waste-type.dto';
import { UpdateWasteTypeDto } from './dto/update-waste-type.dto';

@ApiTags('Waste Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('waste-types')
export class WasteTypesController {
  constructor(private readonly wasteTypesService: WasteTypesService) {}

  @ApiOperation({ summary: 'Create Waste Type' })
  @Post()
  create(@Body() dto: CreateWasteTypeDto) {
    return this.wasteTypesService.create(dto);
  }

  @ApiOperation({ summary: 'Get All Waste Types' })
  @Get()
  findAll() {
    return this.wasteTypesService.findAll();
  }

  @ApiOperation({ summary: 'Get Waste Type Detail' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.wasteTypesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Waste Type' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWasteTypeDto,
  ) {
    return this.wasteTypesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete Waste Type' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.wasteTypesService.remove(id);
  }
}
