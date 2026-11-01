import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { JwtUser } from '../auth/jwt.strategy';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { success } from '../common/api-response';
import { positiveInt } from '../common/input';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('NguoiDung')
@Controller('api/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll() {
    return success(await this.users.findAll());
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @HttpCode(200)
  async create(@Body() dto: SignUpDto) {
    return success(await this.users.create(dto, true));
  }

  @Delete()
  @ApiOperation({ summary: 'Delete a user by ID' })
  async remove(@Query('id') id: string) {
    return success(await this.users.remove(positiveInt(id, 'id')));
  }

  @Get('phan-trang-tim-kiem')
  @ApiOperation({ summary: 'Paginate and search users' })
  @ApiQuery({ name: 'pageIndex', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'keyword', required: false })
  async paginate(
    @Query('pageIndex') pageIndex: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('keyword') keyword?: string,
  ) {
    return success(await this.users.paginate(
      positiveInt(pageIndex, 'pageIndex', 1),
      positiveInt(pageSize, 'pageSize', 10),
      keyword,
    ));
  }

  @Get('search/:TenNguoiDung')
  @ApiOperation({ summary: 'Search users by name' })
  async search(@Param('TenNguoiDung') name: string) {
    return success(await this.users.search(name));
  }

  @Post('upload-avatar')
  @ApiOperation({ summary: 'Upload an avatar for the signed-in user' })
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
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
  async uploadAvatar(
    @Req() request: Request & { user: JwtUser },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Thiếu formFile');
    return success(await this.users.updateAvatar(request.user.userId, file.filename));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details by ID' })
  async findOne(@Param('id') id: string) {
    return success(await this.users.findOne(positiveInt(id, 'id')));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return success(await this.users.update(positiveInt(id, 'id'), dto));
  }
}
