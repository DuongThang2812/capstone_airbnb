import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { success } from '../common/api-response';
import { positiveInt } from '../common/input';
import { DatPhongService } from './dat-phong.service';
import { DatPhongDto, UpdateDatPhongDto } from './dto/dat-phong.dto';

@ApiTags('DatPhong')
@Controller('api/dat-phong')
export class DatPhongController {
  constructor(private readonly datPhong: DatPhongService) {}

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  async findAll() {
    return success(await this.datPhong.findAll());
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Create a new booking' })
  async create(@Body() dto: DatPhongDto) {
    return success(await this.datPhong.create(dto));
  }

  @Get('lay-theo-nguoi-dung/:MaNguoiDung')
  @ApiOperation({ summary: 'Get bookings by user ID (MaNguoiDung)' })
  async findByUser(@Param('MaNguoiDung') userId: string) {
    return success(await this.datPhong.findByUser(positiveInt(userId, 'MaNguoiDung')));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details by ID' })
  async findOne(@Param('id') id: string) {
    return success(await this.datPhong.findOne(positiveInt(id, 'id')));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a booking by ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateDatPhongDto) {
    return success(await this.datPhong.update(positiveInt(id, 'id'), dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking by ID' })
  async remove(@Param('id') id: string) {
    return success(await this.datPhong.remove(positiveInt(id, 'id')));
  }
}
