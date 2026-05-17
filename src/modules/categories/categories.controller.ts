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
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Create Category' })
  @Roles(Role.ADMIN, Role.OFFICER)
  @Post()
  create(@Body() dto: CreateCategoryDto, @Request() req: any) {
    return this.categoriesService.create(dto, req.user.companyId);
  }

  @ApiOperation({ summary: 'Get All Categories' })
  @Get()
  findAll(@Request() req: any) {
    return this.categoriesService.findAll(req.user.companyId);
  }

  @ApiOperation({ summary: 'Get Category Detail' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.categoriesService.findOne(id, req.user.companyId);
  }

  @ApiOperation({ summary: 'Update Category' })
  @Roles(Role.ADMIN, Role.OFFICER)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
    @Request() req: any,
  ) {
    return this.categoriesService.update(id, dto, req.user.companyId);
  }

  @ApiOperation({ summary: 'Delete Category' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.categoriesService.remove(id, req.user.companyId);
  }
}
