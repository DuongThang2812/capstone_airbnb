import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { success } from '../common/api-response';
import { positiveInt } from '../common/input';
import { UpdateViTriDto, ViTriDto } from './dto/vi-tri.dto';
import { ViTriService } from './vi-tri.service';

@ApiTags('ViTri')
@Controller('api/vi-tri')
export class ViTriController {
  constructor(private readonly viTri: ViTriService) {}

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  async findAll() {
    return success(await this.viTri.findAll());
  }

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async create(@Body() dto: ViTriDto) {
    return success(await this.viTri.create(dto));
  }

  @Get('phan-trang-tim-kiem')
  @ApiOperation({ summary: 'Paginate and search locations by name' })
  @ApiQuery({ name: 'pageIndex', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'keyword', required: false })
  async paginate(
    @Query('pageIndex') pageIndex: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('keyword') keyword?: string,
  ) {
    return success(await this.viTri.paginate(
      positiveInt(pageIndex, 'pageIndex', 1),
      positiveInt(pageSize, 'pageSize', 10),
      keyword,
    ));
  }

  @Post('upload-hinh-vitri')
  @ApiOperation({ summary: 'Upload an image for a location by maViTri' })
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'maViTri', required: true, type: Number })
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
    @Query('maViTri') maViTri: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const id = positiveInt(maViTri, 'maViTri');
    if (!file) throw new BadRequestException('Thiếu formFile');
    return success(await this.viTri.updateImage(id, file.filename));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location details by ID' })
  async findOne(@Param('id') id: string) {
    return success(await this.viTri.findOne(positiveInt(id, 'id')));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a location by ID' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() dto: UpdateViTriDto) {
    return success(await this.viTri.update(positiveInt(id, 'id'), dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a location by ID' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return success(await this.viTri.remove(positiveInt(id, 'id')));
  }
}
