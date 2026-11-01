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
  @ApiOperation({
    summary: "List bookings",
    description: "Public; no JWT required. Returns all bookings.",
  })
  async findAll() {
    return success(await this.datPhong.findAll());
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: "Create a booking",
    description: "Public; no JWT required. Body: maPhong (room ID), ngayDen and ngayDi (ISO 8601 dates, with departure after arrival), soLuongKhach (positive guest count), and maNguoiDat (user ID).",
  })
  async create(@Body() dto: DatPhongDto) {
    return success(await this.datPhong.create(dto));
  }

  @Get('lay-theo-nguoi-dung/:MaNguoiDung')
  @ApiOperation({
    summary: "List bookings by user",
    description: "Public; no JWT required. Path MaNguoiDung: positive user ID.",
  })
  async findByUser(@Param('MaNguoiDung') userId: string) {
    return success(await this.datPhong.findByUser(positiveInt(userId, 'MaNguoiDung')));
  }

  @Get(':id')
  @ApiOperation({
    summary: "Get a booking by ID",
    description: "Public; no JWT required. Path id: positive booking ID.",
  })
  async findOne(@Param('id') id: string) {
    return success(await this.datPhong.findOne(positiveInt(id, 'id')));
  }

  @Put(':id')
  @ApiOperation({
    summary: "Update a booking",
    description: "Public; no JWT required. Path id: positive booking ID. Body: at least one of maPhong, ngayDen, ngayDi, soLuongKhach, or maNguoiDat; departure must follow arrival.",
  })
  async update(@Param('id') id: string, @Body() dto: UpdateDatPhongDto) {
    return success(await this.datPhong.update(positiveInt(id, 'id'), dto));
  }

  @Delete(':id')
  @ApiOperation({
    summary: "Delete a booking",
    description: "Public; no JWT required. Path id: positive booking ID.",
  })
  async remove(@Param('id') id: string) {
    return success(await this.datPhong.remove(positiveInt(id, 'id')));
  }
}
