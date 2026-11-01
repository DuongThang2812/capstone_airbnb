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
    summary: "Lấy danh sách phòng thuê",
    description: "Công khai, không yêu cầu JWT Bearer Token. Không có tham số đầu vào; trả về toàn bộ phòng thuê.",
  })
  async findAll() {
    return success(await this.phongThue.findAll());
  }

  @Post()
  @ApiOperation({
    summary: "Tạo phòng thuê mới",
    description: "Yêu cầu JWT Bearer Token. Body: tenPhong là tên phòng; khach, phongNgu, giuong, phongTam là sức chứa và số lượng tiện ích; moTa, giaTien là mô tả và giá; mayGiat, banLa, tivi, dieuHoa, wifi, bep, doXe, hoBoi, banUi là các cờ tiện nghi; maViTri là mã vị trí tồn tại; hinhAnh là đường dẫn ảnh tùy chọn.",
  })
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async create(@Body() dto: PhongThueDto) {
    return success(await this.phongThue.create(dto));
  }

  @Get('lay-phong-theo-vi-tri')
  @ApiOperation({
    summary: "Lấy phòng thuê theo vị trí",
    description: "Công khai, không yêu cầu JWT Bearer Token. Query maViTri là mã vị trí nguyên dương để lọc danh sách phòng.",
  })
  @ApiQuery({ name: 'maViTri', required: true, type: Number })
  async findByLocation(@Query('maViTri') maViTri: string) {
    return success(await this.phongThue.findByLocation(positiveInt(maViTri, 'maViTri')));
  }

  @Get('phan-trang-tim-kiem')
  @ApiOperation({
    summary: "Phân trang và tìm kiếm phòng thuê",
    description: "Công khai, không yêu cầu JWT Bearer Token. Query pageIndex là số trang (mặc định 1), pageSize là số bản ghi mỗi trang (mặc định 10), keyword lọc theo tenPhong.",
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
    summary: "Tải ảnh cho phòng thuê",
    description: "Yêu cầu JWT Bearer Token. Query maPhong là mã phòng nguyên dương cần gắn ảnh. Body multipart/form-data: formFile là ảnh JPG, PNG hoặc WebP, tối đa 5 MB.",
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
    summary: "Lấy chi tiết phòng thuê theo mã",
    description: "Công khai, không yêu cầu JWT Bearer Token. Path id là mã phòng nguyên dương cần xem.",
  })
  async findOne(@Param('id') id: string) {
    return success(await this.phongThue.findOne(positiveInt(id, 'id')));
  }

  @Put(':id')
  @ApiOperation({
    summary: "Cập nhật phòng thuê theo mã",
    description: "Yêu cầu JWT Bearer Token. Path id là mã phòng nguyên dương. Body có thể gồm toàn bộ trường của phòng: tenPhong, khach, phongNgu, giuong, phongTam, moTa, giaTien, các cờ tiện nghi, maViTri và hinhAnh; cần ít nhất một trường.",
  })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() dto: UpdatePhongThueDto) {
    return success(await this.phongThue.update(positiveInt(id, 'id'), dto));
  }

  @Delete(':id')
  @ApiOperation({
    summary: "Xóa phòng thuê theo mã",
    description: "Yêu cầu JWT Bearer Token. Path id là mã phòng nguyên dương cần xóa; đặt phòng và bình luận liên quan bị xóa theo khóa ngoại.",
  })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return success(await this.phongThue.remove(positiveInt(id, 'id')));
  }
}
