import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { positiveInt } from '../common/input';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePhongThueDto, PhongThueDto } from './dto/phong-thue.dto';
import { publicPhongThue } from './phong-thue.mapper';

@Injectable()
export class PhongThueService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rooms = await this.prisma.phong.findMany({ orderBy: { id: 'asc' } });
    return rooms.map(publicPhongThue);
  }

  async create(dto: PhongThueDto) {
    if (!dto) throw new BadRequestException('Thiếu thông tin phòng');
    const data = this.createData(dto);
    await this.ensureLocationExists(data.ma_vi_tri);
    const room = await this.prisma.phong.create({ data });
    return publicPhongThue(room);
  }

  async findByLocation(maViTri: number) {
    const rooms = await this.prisma.phong.findMany({
      where: { ma_vi_tri: maViTri },
      orderBy: { id: 'asc' },
    });
    return rooms.map(publicPhongThue);
  }

  async paginate(pageIndex: number, pageSize: number, keyword?: string) {
    const keywords = keyword?.trim() || '';
    const where: Prisma.PhongWhereInput = keywords
      ? { ten_phong: { contains: keywords } }
      : {};
    const [totalRow, rooms] = await Promise.all([
      this.prisma.phong.count({ where }),
      this.prisma.phong.findMany({
        where,
        skip: (pageIndex - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'asc' },
      }),
    ]);
    return { pageIndex, pageSize, totalRow, keywords, data: rooms.map(publicPhongThue) };
  }

  async updateImage(id: number, filename: string) {
    await this.findExisting(id);
    const room = await this.prisma.phong.update({
      where: { id },
      data: { hinh_anh: `/public/img/${filename}` },
    });
    return publicPhongThue(room);
  }

  async findOne(id: number) {
    return publicPhongThue(await this.findExisting(id));
  }

  async update(id: number, dto: UpdatePhongThueDto) {
    await this.findExisting(id);
    if (!dto) throw new BadRequestException('Thiếu thông tin cập nhật');
    const data = this.updateData(dto);
    if (Object.keys(data).length === 0) throw new BadRequestException('Cần ít nhất một trường để cập nhật');
    if (dto.maViTri !== undefined) {
      await this.ensureLocationExists(positiveInt(String(dto.maViTri), 'maViTri'));
    }
    const room = await this.prisma.phong.update({ where: { id }, data });
    return publicPhongThue(room);
  }

  async remove(id: number) {
    await this.findExisting(id);
    const room = await this.prisma.phong.delete({ where: { id } });
    return publicPhongThue(room);
  }

  private createData(dto: PhongThueDto): Prisma.PhongUncheckedCreateInput {
    return {
      ten_phong: this.requiredText(dto.tenPhong, 'tenPhong', 255),
      khach: this.requiredInt(dto.khach, 'khach', 1),
      phong_ngu: this.requiredInt(dto.phongNgu, 'phongNgu'),
      giuong: this.requiredInt(dto.giuong, 'giuong'),
      phong_tam: this.requiredInt(dto.phongTam, 'phongTam'),
      mo_ta: this.requiredText(dto.moTa, 'moTa'),
      gia_tien: this.requiredInt(dto.giaTien, 'giaTien'),
      may_giat: this.requiredBoolean(dto.mayGiat, 'mayGiat'),
      ban_la: this.requiredBoolean(dto.banLa, 'banLa'),
      tivi: this.requiredBoolean(dto.tivi, 'tivi'),
      dieu_hoa: this.requiredBoolean(dto.dieuHoa, 'dieuHoa'),
      wifi: this.requiredBoolean(dto.wifi, 'wifi'),
      bep: this.requiredBoolean(dto.bep, 'bep'),
      do_xe: this.requiredBoolean(dto.doXe, 'doXe'),
      ho_boi: this.requiredBoolean(dto.hoBoi, 'hoBoi'),
      ban_ui: this.requiredBoolean(dto.banUi, 'banUi'),
      ma_vi_tri: positiveInt(String(dto.maViTri), 'maViTri'),
      hinh_anh: dto.hinhAnh === undefined ? null : this.requiredText(dto.hinhAnh, 'hinhAnh', 255),
    };
  }

  private updateData(dto: UpdatePhongThueDto): Prisma.PhongUncheckedUpdateInput {
    const data: Prisma.PhongUncheckedUpdateInput = {};
    if (dto.tenPhong !== undefined) data.ten_phong = this.requiredText(dto.tenPhong, 'tenPhong', 255);
    if (dto.khach !== undefined) data.khach = this.requiredInt(dto.khach, 'khach', 1);
    if (dto.phongNgu !== undefined) data.phong_ngu = this.requiredInt(dto.phongNgu, 'phongNgu');
    if (dto.giuong !== undefined) data.giuong = this.requiredInt(dto.giuong, 'giuong');
    if (dto.phongTam !== undefined) data.phong_tam = this.requiredInt(dto.phongTam, 'phongTam');
    if (dto.moTa !== undefined) data.mo_ta = this.requiredText(dto.moTa, 'moTa');
    if (dto.giaTien !== undefined) data.gia_tien = this.requiredInt(dto.giaTien, 'giaTien');
    if (dto.mayGiat !== undefined) data.may_giat = this.requiredBoolean(dto.mayGiat, 'mayGiat');
    if (dto.banLa !== undefined) data.ban_la = this.requiredBoolean(dto.banLa, 'banLa');
    if (dto.tivi !== undefined) data.tivi = this.requiredBoolean(dto.tivi, 'tivi');
    if (dto.dieuHoa !== undefined) data.dieu_hoa = this.requiredBoolean(dto.dieuHoa, 'dieuHoa');
    if (dto.wifi !== undefined) data.wifi = this.requiredBoolean(dto.wifi, 'wifi');
    if (dto.bep !== undefined) data.bep = this.requiredBoolean(dto.bep, 'bep');
    if (dto.doXe !== undefined) data.do_xe = this.requiredBoolean(dto.doXe, 'doXe');
    if (dto.hoBoi !== undefined) data.ho_boi = this.requiredBoolean(dto.hoBoi, 'hoBoi');
    if (dto.banUi !== undefined) data.ban_ui = this.requiredBoolean(dto.banUi, 'banUi');
    if (dto.maViTri !== undefined) data.ma_vi_tri = positiveInt(String(dto.maViTri), 'maViTri');
    if (dto.hinhAnh !== undefined) data.hinh_anh = this.requiredText(dto.hinhAnh, 'hinhAnh', 255);
    return data;
  }

  private async findExisting(id: number) {
    const room = await this.prisma.phong.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Không tìm thấy phòng thuê');
    return room;
  }

  private async ensureLocationExists(id: number): Promise<void> {
    const location = await this.prisma.viTri.findUnique({ where: { id } });
    if (!location) throw new NotFoundException('Không tìm thấy vị trí');
  }

  private requiredText(value: unknown, field: string, maxLength?: number): string {
    if (typeof value !== 'string' || !value.trim() || (maxLength !== undefined && value.length > maxLength)) {
      throw new BadRequestException(`${field} không hợp lệ`);
    }
    return value.trim();
  }

  private requiredInt(value: unknown, field: string, min = 0): number {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min) {
      throw new BadRequestException(`${field} phải là số nguyên từ ${min} trở lên`);
    }
    return value;
  }

  private requiredBoolean(value: unknown, field: string): boolean {
    if (typeof value !== 'boolean') throw new BadRequestException(`${field} phải là boolean`);
    return value;
  }
}
