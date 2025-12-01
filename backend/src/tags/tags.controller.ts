import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-role.enum';
import { Public } from '../auth/decorators/public.decorator';

@Controller('tags')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @Public() // ✅ Público - cualquiera puede ver los tags
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  @Public() // ✅ Público - cualquiera puede ver un tag específico
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN) // ✅ Solo ADMIN puede eliminar tags
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}