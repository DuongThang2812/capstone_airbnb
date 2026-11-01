import { Phong } from '@prisma/client';

export function publicPhongThue(phong: Phong) {
  return {
    id: phong.id,
    tenPhong: phong.ten_phong,
    khach: phong.khach,
    phongNgu: phong.phong_ngu,
    giuong: phong.giuong,
    phongTam: phong.phong_tam,
    moTa: phong.mo_ta,
    giaTien: phong.gia_tien,
    mayGiat: phong.may_giat,
    banLa: phong.ban_la,
    tivi: phong.tivi,
    dieuHoa: phong.dieu_hoa,
    wifi: phong.wifi,
    bep: phong.bep,
    doXe: phong.do_xe,
    hoBoi: phong.ho_boi,
    banUi: phong.ban_ui,
    maViTri: phong.ma_vi_tri,
    hinhAnh: phong.hinh_anh,
  };
}
