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
  @ApiOperation({
    summary: "List users",
    description: "Public; no JWT required. Returns all users without passwords.",
  })
  async findAll() {
    return success(await this.users.findAll());
  }

  @Post()
  @ApiOperation({
    summary: "Create a user",
    description: "Public; no JWT required. Body: name, unique email, and password are required; phone, birthday (YYYY-MM-DD), gender, and role are optional.",
  })
  @HttpCode(200)
  async create(@Body() dto: SignUpDto) {
    return success(await this.users.create(dto, true));
  }

  @Delete()
  @ApiOperation({
    summary: "Delete a user",
    description: "Public; no JWT required. Query id: positive user ID. Related bookings and comments are deleted.",
  })
  async remove(@Query('id') id: string) {
    return success(await this.users.remove(positiveInt(id, 'id')));
  }

  @Get('phan-trang-tim-kiem')
  @ApiOperation({
    summary: "Search and paginate users",
    description: "Public; no JWT required. Query pageIndex (default 1), pageSize (default 10), and optional keyword to filter names.",
  })
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
  @ApiOperation({
    summary: "Search users by name",
    description: "Public; no JWT required. Path TenNguoiDung: name keyword to match.",
  })
  async search(@Param('TenNguoiDung') name: string) {
    return success(await this.users.search(name));
  }

  @Post('upload-avatar')
  @ApiOperation({
    summary: "Upload the current user's avatar",
    description: "JWT Bearer token required. Send formFile as a JPG, PNG, or WebP image (up to 5 MB) in multipart/form-data. The token identifies the user.",
  })
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
  @ApiOperation({
    summary: "Get a user by ID",
    description: "Public; no JWT required. Path id: positive user ID. The response excludes the password.",
  })
  async findOne(@Param('id') id: string) {
    return success(await this.users.findOne(positiveInt(id, 'id')));
  }

  @Put(':id')
  @ApiOperation({
    summary: "Update a user",
    description: "Public; no JWT required. Path id: positive user ID. Body: at least one of name, email, password, phone, birthday (YYYY-MM-DD), gender, or role.",
  })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return success(await this.users.update(positiveInt(id, 'id'), dto));
  }
}
