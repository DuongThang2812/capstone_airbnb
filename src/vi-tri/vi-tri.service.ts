import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateViTriDto, ViTriDto } from './dto/vi-tri.dto';
import { publicViTri } from './vi-tri.mapper';

@Injectable()
export class ViTriService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const locations = await this.prisma.viTri.findMany({ orderBy: { id: 'asc' } });
    return locations.map(publicViTri);
  }

  async create(dto: ViTriDto) {
    if (!dto) throw new BadRequestException('Thiếu thông tin vị trí');
    const location = await this.prisma.viTri.create({
      data: {
        ten_vi_tri: this.requiredText(dto.tenViTri, 'tenViTri'),
        tinh_thanh: this.requiredText(dto.tinhThanh, 'tinhThanh'),
        quoc_gia: this.requiredText(dto.quocGia, 'quocGia'),
        hinh_anh: dto.hinhAnh === undefined ? null : this.requiredText(dto.hinhAnh, 'hinhAnh'),
      },
    });
    return publicViTri(location);
  }

  async paginate(pageIndex: number, pageSize: number, keyword?: string) {
    const keywords = keyword?.trim() || '';
    const where: Prisma.ViTriWhereInput = keywords
      ? { ten_vi_tri: { contains: keywords } }
      : {};
    const [totalRow, locations] = await Promise.all([
      this.prisma.viTri.count({ where }),
      this.prisma.viTri.findMany({
        where,
        skip: (pageIndex - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'asc' },
      }),
    ]);
    return { pageIndex, pageSize, totalRow, keywords, data: locations.map(publicViTri) };
  }

  async updateImage(id: number, filename: string) {
    await this.findExisting(id);
    const location = await this.prisma.viTri.update({
      where: { id },
      data: { hinh_anh: `/public/img/${filename}` },
    });
    return publicViTri(location);
  }

  async findOne(id: number) {
    return publicViTri(await this.findExisting(id));
  }

  async update(id: number, dto: UpdateViTriDto) {
    await this.findExisting(id);
    if (!dto) throw new BadRequestException('Thiếu thông tin cập nhật');
    const data: Prisma.ViTriUpdateInput = {};
    if (dto.tenViTri !== undefined) data.ten_vi_tri = this.requiredText(dto.tenViTri, 'tenViTri');
    if (dto.tinhThanh !== undefined) data.tinh_thanh = this.requiredText(dto.tinhThanh, 'tinhThanh');
    if (dto.quocGia !== undefined) data.quoc_gia = this.requiredText(dto.quocGia, 'quocGia');
    if (dto.hinhAnh !== undefined) data.hinh_anh = this.requiredText(dto.hinhAnh, 'hinhAnh');
    if (Object.keys(data).length === 0) throw new BadRequestException('Cần ít nhất một trường để cập nhật');
    const location = await this.prisma.viTri.update({ where: { id }, data });
    return publicViTri(location);
  }

  async remove(id: number) {
    await this.findExisting(id);
    const location = await this.prisma.viTri.delete({ where: { id } });
    return publicViTri(location);
  }

  private async findExisting(id: number) {
    const location = await this.prisma.viTri.findUnique({ where: { id } });
    if (!location) throw new NotFoundException('Không tìm thấy vị trí');
    return location;
  }

  private requiredText(value: unknown, field: string): string {
    if (typeof value !== 'string' || !value.trim() || value.length > 255) {
      throw new BadRequestException(`${field} phải là chuỗi từ 1 đến 255 ký tự`);
    }
    return value.trim();
  }
}
