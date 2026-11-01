import { DatPhong } from '@prisma/client';

export function publicDatPhong(booking: DatPhong) {
  return {
    id: booking.id,
    maPhong: booking.ma_phong,
    ngayDen: booking.ngay_den,
    ngayDi: booking.ngay_di,
    soLuongKhach: booking.so_luong_khach,
    maNguoiDat: booking.ma_nguoi_dat,
  };
}
