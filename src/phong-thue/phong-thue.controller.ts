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
  @ApiOperation({ summary: 'Get all rooms' })
  async findAll() {
    return success(await this.phongThue.findAll());
  }

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async create(@Body() dto: PhongThueDto) {
    return success(await this.phongThue.create(dto));
  }

  @Get('lay-phong-theo-vi-tri')
  @ApiOperation({ summary: 'Get rooms by location ID (maViTri)' })
  @ApiQuery({ name: 'maViTri', required: true, type: Number })
  async findByLocation(@Query('maViTri') maViTri: string) {
    return success(await this.phongThue.findByLocation(positiveInt(maViTri, 'maViTri')));
  }

  @Get('phan-trang-tim-kiem')
  @ApiOperation({ summary: 'Paginate and search rooms by name' })
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
  @ApiOperation({ summary: 'Upload an image for a room by maPhong' })
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
  @ApiOperation({ summary: 'Get room details by ID' })
  async findOne(@Param('id') id: string) {
    return success(await this.phongThue.findOne(positiveInt(id, 'id')));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a room by ID' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() dto: UpdatePhongThueDto) {
    return success(await this.phongThue.update(positiveInt(id, 'id'), dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room by ID' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return success(await this.phongThue.remove(positiveInt(id, 'id')));
  }
}
