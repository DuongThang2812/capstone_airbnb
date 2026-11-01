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
  @ApiOperation({
    summary: "Lấy danh sách vị trí",
    description: "Công khai, không yêu cầu JWT Bearer Token. Không có tham số đầu vào; trả về toàn bộ vị trí du lịch.",
  })
  async findAll() {
    return success(await this.viTri.findAll());
  }

  @Post()
  @ApiOperation({
    summary: "Tạo vị trí mới",
    description: "Yêu cầu JWT Bearer Token. Body: tenViTri là tên địa điểm, tinhThanh là tỉnh hoặc thành phố, quocGia là quốc gia; hinhAnh là đường dẫn ảnh tùy chọn.",
  })
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async create(@Body() dto: ViTriDto) {
    return success(await this.viTri.create(dto));
  }

  @Get('phan-trang-tim-kiem')
  @ApiOperation({
    summary: "Phân trang và tìm kiếm vị trí",
    description: "Công khai, không yêu cầu JWT Bearer Token. Query pageIndex là số trang (mặc định 1), pageSize là số bản ghi mỗi trang (mặc định 10), keyword lọc theo tenViTri.",
  })
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
  @ApiOperation({
    summary: "Tải ảnh cho vị trí",
    description: "Yêu cầu JWT Bearer Token. Query maViTri là mã vị trí nguyên dương cần gắn ảnh. Body multipart/form-data: formFile là ảnh JPG, PNG hoặc WebP, tối đa 5 MB.",
  })
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
  @ApiOperation({
    summary: "Lấy chi tiết vị trí theo mã",
    description: "Công khai, không yêu cầu JWT Bearer Token. Path id là mã vị trí nguyên dương cần xem.",
  })
  async findOne(@Param('id') id: string) {
    return success(await this.viTri.findOne(positiveInt(id, 'id')));
  }

  @Put(':id')
  @ApiOperation({
    summary: "Cập nhật vị trí theo mã",
    description: "Yêu cầu JWT Bearer Token. Path id là mã vị trí nguyên dương. Body có thể gồm tenViTri, tinhThanh, quocGia, hinhAnh; cần ít nhất một trường.",
  })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() dto: UpdateViTriDto) {
    return success(await this.viTri.update(positiveInt(id, 'id'), dto));
  }

  @Delete(':id')
  @ApiOperation({
    summary: "Xóa vị trí theo mã",
    description: "Yêu cầu JWT Bearer Token. Path id là mã vị trí nguyên dương cần xóa; phòng thuộc vị trí và dữ liệu liên quan bị xóa theo khóa ngoại.",
  })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return success(await this.viTri.remove(positiveInt(id, 'id')));
  }
}
