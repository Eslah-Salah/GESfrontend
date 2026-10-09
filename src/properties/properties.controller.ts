import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { StartAccessHoldDto } from './dto/start-access-hold.dto';
import { PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  findAll() {
    return this.propertiesService.findAll();
  }

  @Post()
  create(@Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(dto);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.propertiesService.changeStatus(id, dto.action);
  }

  @Post(':id/access-hold')
  startAccessHold(
    @Param('id') id: string,
    @Body() dto: StartAccessHoldDto,
  ) {
    return this.propertiesService.startAccessHold(id, dto);
  }
}
