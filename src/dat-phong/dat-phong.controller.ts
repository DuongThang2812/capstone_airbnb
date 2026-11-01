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
    summary: "Lấy danh sách đặt phòng",
    description: "Công khai, không yêu cầu JWT Bearer Token. Không có tham số đầu vào; trả về toàn bộ đơn đặt phòng.",
  })
  async findAll() {
    return success(await this.datPhong.findAll());
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: "Tạo đơn đặt phòng",
    description: "Công khai, không yêu cầu JWT Bearer Token. Body: maPhong là mã phòng tồn tại, ngayDen và ngayDi là thời điểm ISO 8601 (ngày đi sau ngày đến), soLuongKhach là số khách nguyên dương, maNguoiDat là mã người dùng tồn tại.",
  })
  async create(@Body() dto: DatPhongDto) {
    return success(await this.datPhong.create(dto));
  }

  @Get('lay-theo-nguoi-dung/:MaNguoiDung')
  @ApiOperation({
    summary: "Lấy đặt phòng theo người dùng",
    description: "Công khai, không yêu cầu JWT Bearer Token. Path MaNguoiDung là mã người dùng nguyên dương để lọc các đơn đặt phòng.",
  })
  async findByUser(@Param('MaNguoiDung') userId: string) {
    return success(await this.datPhong.findByUser(positiveInt(userId, 'MaNguoiDung')));
  }

  @Get(':id')
  @ApiOperation({
    summary: "Lấy chi tiết đặt phòng theo mã",
    description: "Công khai, không yêu cầu JWT Bearer Token. Path id là mã đơn đặt phòng nguyên dương cần xem.",
  })
  async findOne(@Param('id') id: string) {
    return success(await this.datPhong.findOne(positiveInt(id, 'id')));
  }

  @Put(':id')
  @ApiOperation({
    summary: "Cập nhật đặt phòng theo mã",
    description: "Công khai, không yêu cầu JWT Bearer Token. Path id là mã đơn đặt phòng nguyên dương. Body có thể gồm maPhong, ngayDen, ngayDi, soLuongKhach, maNguoiDat; cần ít nhất một trường và ngày đi phải sau ngày đến.",
  })
  async update(@Param('id') id: string, @Body() dto: UpdateDatPhongDto) {
    return success(await this.datPhong.update(positiveInt(id, 'id'), dto));
  }

  @Delete(':id')
  @ApiOperation({
    summary: "Xóa đặt phòng theo mã",
    description: "Công khai, không yêu cầu JWT Bearer Token. Path id là mã đơn đặt phòng nguyên dương cần xóa.",
  })
  async remove(@Param('id') id: string) {
    return success(await this.datPhong.remove(positiveInt(id, 'id')));
  }
}
