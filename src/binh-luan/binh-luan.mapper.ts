import { BinhLuan } from '@prisma/client';

type BinhLuanWithUser = BinhLuan & {
  NguoiDung?: { name: string; avatar: string | null };
};

export function publicBinhLuan(comment: BinhLuanWithUser) {
  const content = {
    id: comment.id,
    maPhong: comment.ma_phong,
    maNguoiBinhLuan: comment.ma_nguoi_binh_luan,
    ngayBinhLuan: comment.ngay_binh_luan,
    noiDung: comment.noi_dung,
    saoBinhLuan: comment.sao_binh_luan,
  };
  return comment.NguoiDung
    ? { ...content, tenNguoiBinhLuan: comment.NguoiDung.name, avatar: comment.NguoiDung.avatar }
    : content;
}
