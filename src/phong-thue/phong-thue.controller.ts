import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { success } from '../common/api-response';
import { positiveInt } from '../common/input';
import { UpdatePhongThueDto, PhongThueDto } from './dto/phong-thue.dto';
import { PhongThueService } from './phong-thue.service';

@ApiTags('Phong')
@Controller('api/phong-thue')
export class PhongThueController {
  constructor(private readonly phongThue: PhongThueService) {}

  @Get()
  @ApiOperation({
    summary: "List rooms",
    description: "Public; no JWT required. Returns all rental rooms.",
  })
  async findAll() {
    return success(await this.phongThue.findAll());
  }

  @Post()
  @ApiOperation({
    summary: "Create a room",
    description: "JWT Bearer token required. Body: tenPhong (name), khach (guests), phongNgu (bedrooms), giuong (beds), phongTam (bathrooms), moTa (description), giaTien (price), maViTri (location ID), amenity flags, and optional hinhAnh (image URL).",
  })
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async create(@Body() dto: PhongThueDto) {
    return success(await this.phongThue.create(dto));
  }

  @Get('lay-phong-theo-vi-tri')
  @ApiOperation({
    summary: "List rooms by location",
    description: "Public; no JWT required. Query maViTri: positive location ID.",
  })
  @ApiQuery({ name: 'maViTri', required: true, type: Number })
  async findByLocation(@Query('maViTri') maViTri: string) {
    return success(await this.phongThue.findByLocation(positiveInt(maViTri, 'maViTri')));
  }

  @Get('phan-trang-tim-kiem')
  @ApiOperation({
    summary: "Search and paginate rooms",
    description: "Public; no JWT required. Query pageIndex (default 1), pageSize (default 10), and optional keyword to filter room names.",
  })
  @ApiQuery({ name: 'pageIndex', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'keyword', required: false })
  async paginate(
    @Query('pageIndex') pageIndex: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('keyword') keyword?: string,
  ) {
    return success(await this.phongThue.paginate(
      positiveInt(pageIndex, 'pageIndex', 1),
      positiveInt(pageSize, 'pageSize', 10),
      keyword,
    ));
  }

  @Post('upload-hinh-phong')
  @ApiOperation({
    summary: "Upload a room image",
    description: "JWT Bearer token required. Query maPhong: positive room ID. Send formFile as a JPG, PNG, or WebP image (up to 5 MB) in multipart/form-data.",
  })
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'maPhong', required: true, type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { formFile: { type: 'string', format: 'binary' } },
      required: ['formFile'],
    },
  })
  @UseInterceptors(FileInterceptor('formFile', {
    storage: diskStorage({
      destination: './public/img',
      filename: (_request, file, callback) => {
        const extension = file.mimetype === 'image/png'
          ? '.png'
          : file.mimetype === 'image/webp' ? '.webp' : '.jpg';
        callback(null, `${Date.now()}-${randomUUID()}${extension}`);
      },
    }),
    fileFilter: (_request, file, callback) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
      callback(allowed ? null : new BadRequestException('Chỉ chấp nhận ảnh JPG, PNG hoặc WebP'), allowed);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadImage(
    @Query('maPhong') maPhong: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const id = positiveInt(maPhong, 'maPhong');
    if (!file) throw new BadRequestException('Thiếu formFile');
    return success(await this.phongThue.updateImage(id, file.filename));
  }

  @Get(':id')
  @ApiOperation({
    summary: "Get a room by ID",
    description: "Public; no JWT required. Path id: positive room ID.",
  })
  async findOne(@Param('id') id: string) {
    return success(await this.phongThue.findOne(positiveInt(id, 'id')));
  }

  @Put(':id')
  @ApiOperation({
    summary: "Update a room",
    description: "JWT Bearer token required. Path id: positive room ID. Body: at least one room field, including details, amenities, maViTri, or hinhAnh.",
  })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() dto: UpdatePhongThueDto) {
    return success(await this.phongThue.update(positiveInt(id, 'id'), dto));
  }

  @Delete(':id')
  @ApiOperation({
    summary: "Delete a room",
    description: "JWT Bearer token required. Path id: positive room ID. Related bookings and comments are deleted.",
  })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return success(await this.phongThue.remove(positiveInt(id, 'id')));
  }
}
