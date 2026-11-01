import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { success } from '../common/api-response';
import { positiveInt } from '../common/input';
import { BinhLuanService } from './binh-luan.service';
import { BinhLuanDto, UpdateBinhLuanDto } from './dto/binh-luan.dto';

@ApiTags('BinhLuan')
@Controller('api/binh-luan')
export class BinhLuanController {
  constructor(private readonly binhLuan: BinhLuanService) {}

  @Get()
  @ApiOperation({
    summary: "Lấy danh sách bình luận",
    description: "Công khai, không yêu cầu JWT Bearer Token. Không có tham số đầu vào; trả về toàn bộ bình luận.",
  })
  async findAll() {
    return success(await this.binhLuan.findAll());
  }

  @Post()
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Thêm bình luận cho phòng thuê",
    description: "Yêu cầu JWT Bearer Token. Body: maPhong là mã phòng tồn tại, maNguoiBinhLuan là mã người dùng tồn tại, ngayBinhLuan là thời điểm ISO 8601 tùy chọn (mặc định hiện tại), noiDung là nội dung nhận xét, saoBinhLuan là số sao nguyên từ 1 đến 5.",
  })
  async create(@Body() dto: BinhLuanDto) {
    return success(await this.binhLuan.create(dto));
  }

  @Get('lay-binh-luan-theo-phong/:MaPhong')
  @ApiOperation({
    summary: "Lấy bình luận theo phòng thuê",
    description: "Công khai, không yêu cầu JWT Bearer Token. Path MaPhong là mã phòng nguyên dương; phản hồi có thêm tenNguoiBinhLuan và avatar của người viết.",
  })
  async findByRoom(@Param('MaPhong') roomId: string) {
    return success(await this.binhLuan.findByRoom(positiveInt(roomId, 'MaPhong')));
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Cập nhật bình luận theo mã",
    description: "Yêu cầu JWT Bearer Token. Path id là mã bình luận nguyên dương. Body có thể gồm noiDung (nội dung nhận xét) và saoBinhLuan (số sao nguyên từ 1 đến 5); cần ít nhất một trường.",
  })
  async update(@Param('id') id: string, @Body() dto: UpdateBinhLuanDto) {
    return success(await this.binhLuan.update(positiveInt(id, 'id'), dto));
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Xóa bình luận theo mã",
    description: "Yêu cầu JWT Bearer Token. Path id là mã bình luận nguyên dương cần xóa.",
  })
  async remove(@Param('id') id: string) {
    return success(await this.binhLuan.remove(positiveInt(id, 'id')));
  }
}
