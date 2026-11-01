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
    summary: "List comments",
    description: "Public; no JWT required. Returns all comments.",
  })
  async findAll() {
    return success(await this.binhLuan.findAll());
  }

  @Post()
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Create a room comment",
    description: "JWT Bearer token required. Body: maPhong (room ID), maNguoiBinhLuan (user ID), noiDung (comment), saoBinhLuan (1-5 stars), and optional ngayBinhLuan (ISO 8601 date; defaults to now).",
  })
  async create(@Body() dto: BinhLuanDto) {
    return success(await this.binhLuan.create(dto));
  }

  @Get('lay-binh-luan-theo-phong/:MaPhong')
  @ApiOperation({
    summary: "List comments by room",
    description: "Public; no JWT required. Path MaPhong: positive room ID. Includes the author's name and avatar.",
  })
  async findByRoom(@Param('MaPhong') roomId: string) {
    return success(await this.binhLuan.findByRoom(positiveInt(roomId, 'MaPhong')));
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update a comment",
    description: "JWT Bearer token required. Path id: positive comment ID. Body: at least one of noiDung (comment) or saoBinhLuan (1-5 stars).",
  })
  async update(@Param('id') id: string, @Body() dto: UpdateBinhLuanDto) {
    return success(await this.binhLuan.update(positiveInt(id, 'id'), dto));
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Delete a comment",
    description: "JWT Bearer token required. Path id: positive comment ID.",
  })
  async remove(@Param('id') id: string) {
    return success(await this.binhLuan.remove(positiveInt(id, 'id')));
  }
}
