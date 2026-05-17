import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { WasteTypesService } from './waste-types.service';
import { CreateWasteTypeDto } from './dto/create-waste-type.dto';
import { UpdateWasteTypeDto } from './dto/update-waste-type.dto';

@ApiTags('Waste Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('waste-types')
export class WasteTypesController {
  constructor(private readonly wasteTypesService: WasteTypesService) {}

  @ApiOperation({ summary: 'Create Waste Type' })
  @Roles(Role.ADMIN, Role.OFFICER)
  @Post()
  create(@Body() dto: CreateWasteTypeDto, @Request() req: any) {
    return this.wasteTypesService.create(dto, req.user.companyId);
  }

  @ApiOperation({ summary: 'Get All Waste Types' })
  @Get()
  findAll(@Request() req: any) {
    return this.wasteTypesService.findAll(req.user.companyId);
  }

  @ApiOperation({ summary: 'Get Waste Type Detail' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.wasteTypesService.findOne(id, req.user.companyId);
  }

  @ApiOperation({ summary: 'Update Waste Type' })
  @Roles(Role.ADMIN, Role.OFFICER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWasteTypeDto,
    @Request() req: any,
  ) {
    return this.wasteTypesService.update(id, dto, req.user.companyId);
  }

  @ApiOperation({ summary: 'Delete Waste Type' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.wasteTypesService.remove(id, req.user.companyId);
  }
}
