import { ViTri } from '@prisma/client';

export function publicViTri(viTri: ViTri) {
  return {
    id: viTri.id,
    tenViTri: viTri.ten_vi_tri,
    tinhThanh: viTri.tinh_thanh,
    quocGia: viTri.quoc_gia,
    hinhAnh: viTri.hinh_anh,
  };
}
