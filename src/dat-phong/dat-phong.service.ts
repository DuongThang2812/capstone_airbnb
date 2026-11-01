import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatPhong, Prisma } from '@prisma/client';
import { parseIsoDate } from '../common/date';
import { positiveInt } from '../common/input';
import { PrismaService } from '../prisma/prisma.service';
import { DatPhongDto, UpdateDatPhongDto } from './dto/dat-phong.dto';
import { publicDatPhong } from './dat-phong.mapper';

@Injectable()
export class DatPhongService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const bookings = await this.prisma.datPhong.findMany({ orderBy: { id: 'asc' } });
    return bookings.map(publicDatPhong);
  }

  async create(dto: DatPhongDto) {
    if (!dto) throw new BadRequestException('Thiếu thông tin đặt phòng');
    const data = this.createData(dto);
    await this.ensureRoomExists(data.ma_phong);
    await this.ensureUserExists(data.ma_nguoi_dat);
    const booking = await this.prisma.datPhong.create({ data });
    return publicDatPhong(booking);
  }

  async findByUser(userId: number) {
    const bookings = await this.prisma.datPhong.findMany({
      where: { ma_nguoi_dat: userId },
      orderBy: { id: 'asc' },
    });
    return bookings.map(publicDatPhong);
  }

  async findOne(id: number) {
    return publicDatPhong(await this.findExisting(id));
  }

  async update(id: number, dto: UpdateDatPhongDto) {
    const existing = await this.findExisting(id);
    if (!dto) throw new BadRequestException('Thiếu thông tin cập nhật');
    const data = this.updateData(dto, existing);
    if (Object.keys(data).length === 0) throw new BadRequestException('Cần ít nhất một trường để cập nhật');
    if (dto.maPhong !== undefined) await this.ensureRoomExists(positiveInt(String(dto.maPhong), 'maPhong'));
    if (dto.maNguoiDat !== undefined) await this.ensureUserExists(positiveInt(String(dto.maNguoiDat), 'maNguoiDat'));
    const booking = await this.prisma.datPhong.update({ where: { id }, data });
    return publicDatPhong(booking);
  }

  async remove(id: number) {
    await this.findExisting(id);
    const booking = await this.prisma.datPhong.delete({ where: { id } });
    return publicDatPhong(booking);
  }

  private createData(dto: DatPhongDto): Prisma.DatPhongUncheckedCreateInput {
    const ngayDen = parseIsoDate(dto.ngayDen, 'ngayDen');
    const ngayDi = parseIsoDate(dto.ngayDi, 'ngayDi');
    this.validateDateRange(ngayDen, ngayDi);
    return {
      ma_phong: positiveInt(String(dto.maPhong), 'maPhong'),
      ngay_den: ngayDen,
      ngay_di: ngayDi,
      so_luong_khach: this.guestCount(dto.soLuongKhach),
      ma_nguoi_dat: positiveInt(String(dto.maNguoiDat), 'maNguoiDat'),
    };
  }

  private updateData(dto: UpdateDatPhongDto, existing: DatPhong): Prisma.DatPhongUncheckedUpdateInput {
    const data: Prisma.DatPhongUncheckedUpdateInput = {};
    if (dto.maPhong !== undefined) data.ma_phong = positiveInt(String(dto.maPhong), 'maPhong');
    if (dto.maNguoiDat !== undefined) data.ma_nguoi_dat = positiveInt(String(dto.maNguoiDat), 'maNguoiDat');
    if (dto.soLuongKhach !== undefined) data.so_luong_khach = this.guestCount(dto.soLuongKhach);
    const ngayDen = dto.ngayDen === undefined ? existing.ngay_den : parseIsoDate(dto.ngayDen, 'ngayDen');
    const ngayDi = dto.ngayDi === undefined ? existing.ngay_di : parseIsoDate(dto.ngayDi, 'ngayDi');
    if (dto.ngayDen !== undefined) data.ngay_den = ngayDen;
    if (dto.ngayDi !== undefined) data.ngay_di = ngayDi;
    this.validateDateRange(ngayDen, ngayDi);
    return data;
  }

  private async findExisting(id: number) {
    const booking = await this.prisma.datPhong.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Không tìm thấy đặt phòng');
    return booking;
  }

  private async ensureRoomExists(id: number): Promise<void> {
    const room = await this.prisma.phong.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Không tìm thấy phòng thuê');
  }

  private async ensureUserExists(id: number): Promise<void> {
    const user = await this.prisma.nguoiDung.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
  }

  private validateDateRange(ngayDen: Date, ngayDi: Date): void {
    if (ngayDi <= ngayDen) throw new BadRequestException('ngayDi phải sau ngayDen');
  }

  private guestCount(value: unknown): number {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
      throw new BadRequestException('soLuongKhach phải là số nguyên dương');
    }
    return value;
  }
}
