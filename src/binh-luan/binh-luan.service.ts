import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { parseIsoDate } from '../common/date';
import { positiveInt } from '../common/input';
import { PrismaService } from '../prisma/prisma.service';
import { BinhLuanDto, UpdateBinhLuanDto } from './dto/binh-luan.dto';
import { publicBinhLuan } from './binh-luan.mapper';

@Injectable()
export class BinhLuanService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const comments = await this.prisma.binhLuan.findMany({ orderBy: { id: 'asc' } });
    return comments.map(publicBinhLuan);
  }

  async create(dto: BinhLuanDto) {
    if (!dto) throw new BadRequestException('Thiếu thông tin bình luận');
    const data = this.createData(dto);
    await this.ensureRoomExists(data.ma_phong);
    await this.ensureUserExists(data.ma_nguoi_binh_luan);
    const comment = await this.prisma.binhLuan.create({ data });
    return publicBinhLuan(comment);
  }

  async findByRoom(roomId: number) {
    const comments = await this.prisma.binhLuan.findMany({
      where: { ma_phong: roomId },
      include: { NguoiDung: true },
      orderBy: { id: 'asc' },
    });
    return comments.map(publicBinhLuan);
  }

  async update(id: number, dto: UpdateBinhLuanDto) {
    await this.findExisting(id);
    if (!dto) throw new BadRequestException('Thiếu thông tin cập nhật');
    const data: Prisma.BinhLuanUncheckedUpdateInput = {};
    if (dto.noiDung !== undefined) data.noi_dung = this.validContent(dto.noiDung);
    if (dto.saoBinhLuan !== undefined) data.sao_binh_luan = this.validRating(dto.saoBinhLuan);
    if (Object.keys(data).length === 0) throw new BadRequestException('Cần nội dung hoặc số sao để cập nhật');
    const comment = await this.prisma.binhLuan.update({ where: { id }, data });
    return publicBinhLuan(comment);
  }

  async remove(id: number) {
    await this.findExisting(id);
    const comment = await this.prisma.binhLuan.delete({ where: { id } });
    return publicBinhLuan(comment);
  }

  private createData(dto: BinhLuanDto): Prisma.BinhLuanUncheckedCreateInput {
    return {
      ma_phong: positiveInt(String(dto.maPhong), 'maPhong'),
      ma_nguoi_binh_luan: positiveInt(String(dto.maNguoiBinhLuan), 'maNguoiBinhLuan'),
      ngay_binh_luan: dto.ngayBinhLuan === undefined
        ? new Date()
        : parseIsoDate(dto.ngayBinhLuan, 'ngayBinhLuan'),
      noi_dung: this.validContent(dto.noiDung),
      sao_binh_luan: this.validRating(dto.saoBinhLuan),
    };
  }

  private async findExisting(id: number) {
    const comment = await this.prisma.binhLuan.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Không tìm thấy bình luận');
    return comment;
  }

  private async ensureRoomExists(id: number): Promise<void> {
    const room = await this.prisma.phong.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Không tìm thấy phòng thuê');
  }

  private async ensureUserExists(id: number): Promise<void> {
    const user = await this.prisma.nguoiDung.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
  }

  private validContent(value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException('noiDung không được để trống');
    }
    return value.trim();
  }

  private validRating(value: unknown): number {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1 || value > 5) {
      throw new BadRequestException('saoBinhLuan phải từ 1 đến 5');
    }
    return value;
  }
}
