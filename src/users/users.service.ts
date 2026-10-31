import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { publicUser } from './public-user';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.nguoiDung.findMany({ orderBy: { id: 'asc' } });
    return users.map(publicUser);
  }

  async create(dto: SignUpDto, allowRole = false) {
    this.validateCreate(dto);
    await this.ensureEmailAvailable(dto.email.trim());
    const user = await this.prisma.nguoiDung.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim(),
        pass_word: await bcrypt.hash(dto.password, 10),
        phone: dto.phone ?? null,
        birth_day: dto.birthday ?? null,
        gender: dto.gender ?? null,
        role: allowRole && dto.role ? dto.role : 'USER',
      },
    });
    return publicUser(user);
  }

  async remove(id: number) {
    await this.findExisting(id);
    const user = await this.prisma.nguoiDung.delete({ where: { id } });
    return publicUser(user);
  }

  async paginate(pageIndex: number, pageSize: number, keyword?: string) {
    const keywords = keyword?.trim() || '';
    const where: Prisma.NguoiDungWhereInput = keywords
      ? { name: { contains: keywords } }
      : {};
    const [totalRow, users] = await Promise.all([
      this.prisma.nguoiDung.count({ where }),
      this.prisma.nguoiDung.findMany({
        where,
        skip: (pageIndex - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'asc' },
      }),
    ]);
    return { pageIndex, pageSize, totalRow, keywords, data: users.map(publicUser) };
  }

  async search(name: string) {
    if (!name.trim()) throw new BadRequestException('Tên người dùng không được để trống');
    const users = await this.prisma.nguoiDung.findMany({
      where: { name: { contains: name.trim() } },
      orderBy: { id: 'asc' },
    });
    return users.map(publicUser);
  }

  async findOne(id: number) {
    return publicUser(await this.findExisting(id));
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findExisting(id);
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('Cần ít nhất một trường để cập nhật');
    }
    const data = await this.updateData(dto);
    if (typeof data.email === 'string') await this.ensureEmailAvailable(data.email, id);
    const user = await this.prisma.nguoiDung.update({ where: { id }, data });
    return publicUser(user);
  }

  async updateAvatar(id: number, filename: string) {
    await this.findExisting(id);
    const user = await this.prisma.nguoiDung.update({
      where: { id },
      data: { avatar: `/public/img/${filename}` },
    });
    return publicUser(user);
  }

  private async findExisting(id: number) {
    const user = await this.prisma.nguoiDung.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  private async ensureEmailAvailable(email: string, currentId?: number): Promise<void> {
    const user = await this.prisma.nguoiDung.findUnique({ where: { email } });
    if (user && user.id !== currentId) throw new ConflictException('Email đã tồn tại');
  }

  private validateCreate(dto: SignUpDto): void {
    if (!dto || typeof dto.name !== 'string' || !dto.name.trim()) {
      throw new BadRequestException('Tên người dùng là bắt buộc');
    }
    if (typeof dto.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email.trim())) {
      throw new BadRequestException('Email không hợp lệ');
    }
    if (typeof dto.password !== 'string' || !dto.password) {
      throw new BadRequestException('Mật khẩu là bắt buộc');
    }
    if (dto.gender !== undefined && typeof dto.gender !== 'boolean') {
      throw new BadRequestException('gender phải là boolean');
    }
    if (dto.phone !== undefined && typeof dto.phone !== 'string') {
      throw new BadRequestException('phone phải là chuỗi');
    }
    if (dto.birthday !== undefined && typeof dto.birthday !== 'string') {
      throw new BadRequestException('birthday phải là chuỗi');
    }
    if (dto.role !== undefined && typeof dto.role !== 'string') {
      throw new BadRequestException('role phải là chuỗi');
    }
  }

  private async updateData(dto: UpdateUserDto): Promise<Prisma.NguoiDungUpdateInput> {
    const data: Prisma.NguoiDungUpdateInput = {};
    if (dto.name !== undefined) {
      if (typeof dto.name !== 'string' || !dto.name.trim()) throw new BadRequestException('Tên không hợp lệ');
      data.name = dto.name.trim();
    }
    if (dto.email !== undefined) {
      if (typeof dto.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email.trim())) {
        throw new BadRequestException('Email không hợp lệ');
      }
      data.email = dto.email.trim();
    }
    if (dto.password !== undefined) {
      if (typeof dto.password !== 'string' || !dto.password) throw new BadRequestException('Mật khẩu không hợp lệ');
      data.pass_word = await bcrypt.hash(dto.password, 10);
    }
    if (dto.phone !== undefined) {
      if (typeof dto.phone !== 'string') throw new BadRequestException('phone phải là chuỗi');
      data.phone = dto.phone;
    }
    if (dto.birthday !== undefined) {
      if (typeof dto.birthday !== 'string') throw new BadRequestException('birthday phải là chuỗi');
      data.birth_day = dto.birthday;
    }
    if (dto.gender !== undefined) {
      if (typeof dto.gender !== 'boolean') throw new BadRequestException('gender phải là boolean');
      data.gender = dto.gender;
    }
    if (dto.role !== undefined) {
      if (typeof dto.role !== 'string' || !dto.role.trim()) throw new BadRequestException('role không hợp lệ');
      data.role = dto.role.trim();
    }
    return data;
  }
}
