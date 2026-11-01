import bcrypt from 'bcrypt';
import prismaPackage from '@prisma/client';

const { PrismaClient } = prismaPackage;
const prisma = new PrismaClient();
const samplePassword = '123456';

const people = [
  ['Nguyễn Văn An', 'an@example.com', true],
  ['Trần Quốc Bình', 'binh@example.com', true],
  ['Lê Ngọc Chi', 'chi@example.com', false],
  ['Phạm Thị Dung', 'dung@example.com', false],
  ['Võ Đức Minh', 'em@example.com', true],
  ['Nguyễn Minh Tuấn', 'minhtuan.nguyen95@gmail.com', true],
  ['Trần Ngọc Lan Anh', 'lananh.tran98@gmail.com', false],
  ['Lê Hoàng Nam', 'hoangnam.le96@gmail.com', true],
  ['Phạm Thị Thu Hà', 'thuha.pham97@gmail.com', false],
  ['Võ Quốc Bảo', 'quocbao.vo94@gmail.com', true],
  ['Đặng Khánh Linh', 'khanhlinh.dang99@gmail.com', false],
  ['Bùi Đức Anh', 'ducanh.bui93@gmail.com', true],
  ['Hoàng Phương Thảo', 'phuongthao.hoang00@gmail.com', false],
  ['Đỗ Quang Huy', 'quanghuy.do92@gmail.com', true],
  ['Ngô Thanh Trúc', 'thanhtruc.ngo01@gmail.com', false],
  ['Huỳnh Gia Hân', 'giahan.huynh02@gmail.com', false],
  ['Phan Nhật Minh', 'nhatminh.phan95@gmail.com', true],
  ['Vũ Thị Bích Ngọc', 'bichngoc.vu98@gmail.com', false],
  ['Mai Thành Đạt', 'thanhdat.mai96@gmail.com', true],
  ['Trịnh Mỹ Duyên', 'myduyen.trinh99@gmail.com', false],
  ['Hồ Anh Khoa', 'anhkhoa.ho93@gmail.com', true],
  ['Dương Thị Thanh Mai', 'thanhmai.duong97@gmail.com', false],
  ['Nguyễn Hải Đăng', 'haidang.nguyen00@gmail.com', true],
  ['Trần Bảo Châu', 'baochau.tran01@gmail.com', false],
  ['Lê Đức Phúc', 'ducphuc.le94@gmail.com', true],
  ['Phạm Ngọc Ánh', 'ngocanh.pham98@gmail.com', false],
  ['Võ Minh Khôi', 'minhkhoi.vo02@gmail.com', true],
  ['Đặng Thùy Dương', 'thuyduong.dang96@gmail.com', false],
  ['Bùi Quỳnh Như', 'quynhnhu.bui99@gmail.com', false],
  ['Hoàng Tuấn Kiệt', 'tuankiet.hoang95@gmail.com', true],
  ['Đỗ Thảo Vy', 'thaovy.do03@gmail.com', false],
  ['Ngô Thành Luân', 'thanhluan.ngo97@gmail.com', true],
  ['Huỳnh Diệu Linh', 'dieulinh.huynh00@gmail.com', false],
];

const locations = [
  { ten_vi_tri: 'Phố cổ Hội An', tinh_thanh: 'Quảng Nam', quoc_gia: 'Việt Nam' },
  { ten_vi_tri: 'Bãi Sau', tinh_thanh: 'Vũng Tàu', quoc_gia: 'Việt Nam' },
  { ten_vi_tri: 'Hồ Tuyền Lâm', tinh_thanh: 'Đà Lạt', quoc_gia: 'Việt Nam' },
  { ten_vi_tri: 'Bản Cát Cát', tinh_thanh: 'Sa Pa', quoc_gia: 'Việt Nam' },
  { ten_vi_tri: 'Bãi Sao', tinh_thanh: 'Phú Quốc', quoc_gia: 'Việt Nam' },
];

const roomNames = [
  'An Bàng Beach Villa',
  'Căn hộ Gió Biển Vũng Tàu',
  'The Chill Homestay Đà Lạt',
  'Mây Núi Bungalow Sa Pa',
  'Bãi Sao Sunset Villa',
];

const reviews = [
  'Phòng rất sạch sẽ, không gian yên tĩnh và chủ nhà đón tiếp chu đáo.',
  'Vị trí thuận tiện để đi dạo buổi tối, giường êm và wifi ổn định.',
  'Ban công nhìn ra cảnh đẹp, bữa sáng gần nhà có nhiều lựa chọn.',
  'Gia đình tôi nghỉ rất thoải mái, nhà tắm sạch và nước nóng tốt.',
  'Chủ nhà hướng dẫn đường đi rõ ràng, nhận phòng nhanh và dễ dàng.',
  'Không gian ấm cúng, phù hợp cho chuyến đi cuối tuần của hai người.',
  'Từ phòng đi bộ ra khu ăn uống khá gần, buổi tối rất nhộn nhịp.',
  'Căn phòng thoáng mát, đồ dùng đầy đủ và được dọn dẹp cẩn thận.',
  'Tôi thích góc ngồi cạnh cửa sổ, sáng sớm ngắm cảnh rất thư giãn.',
  'Bãi đỗ xe thuận tiện, chủ nhà luôn phản hồi tin nhắn nhanh.',
  'Phòng đúng như hình, khu vực xung quanh yên tĩnh để nghỉ ngơi.',
  'Không khí trong lành, buổi sáng dậy sớm đi dạo rất dễ chịu.',
  'Cả nhóm có chuyến đi vui, bếp gọn gàng và bàn ăn rộng rãi.',
  'Chăn ga thơm sạch, điều hòa chạy êm và phòng cách âm khá tốt.',
  'Nơi ở gần các quán cà phê đẹp, rất tiện khám phá thành phố.',
  'Chủ nhà gợi ý nhiều địa điểm ăn uống ngon mà giá hợp lý.',
  'Phòng có ánh sáng tự nhiên đẹp, phù hợp để nghỉ ngơi và đọc sách.',
  'Từ đây ra bờ biển nhanh, buổi chiều ngắm hoàng hôn rất đẹp.',
  'Nhân viên hỗ trợ nhiệt tình khi chúng tôi đến muộn hơn dự kiến.',
  'Khuôn viên có nhiều cây xanh, trẻ nhỏ trong nhà rất thích.',
  'Đường vào dễ tìm, chỗ nghỉ gọn gàng và có đủ đồ dùng cơ bản.',
  'Tôi ngủ ngon cả hai đêm, khu vực này ít tiếng xe cộ.',
  'Phòng tắm rộng, áp lực nước mạnh và khăn được chuẩn bị sạch sẽ.',
  'View núi vào buổi sáng rất đẹp, không khí mát mẻ dễ chịu.',
  'Giá phòng hợp lý so với vị trí và chất lượng dịch vụ.',
  'Chuyến đi cùng bạn bè rất vui, phòng đủ rộng cho cả nhóm.',
  'Chủ nhà chỉ cho chúng tôi chỗ thuê xe uy tín ngay gần đó.',
  'Nhận phòng linh hoạt, mọi thông tin đều được gửi trước rất rõ.',
  'Không gian nhiều ánh sáng, tối ngồi trò chuyện trên sân rất thích.',
  'Từ homestay có thể đi bộ đến khu tham quan nổi tiếng.',
  'Phòng sạch, nệm êm và có đủ ổ cắm cho mọi người sử dụng.',
  'Chủ nhà thân thiện, chuyến nghỉ dưỡng của gia đình thật trọn vẹn.',
  'Tôi sẽ quay lại nếu có dịp, mọi thứ đúng với mong đợi.',
];

async function rowCounts() {
  const [NguoiDung, ViTri, Phong, DatPhong, BinhLuan] = await Promise.all([
    prisma.nguoiDung.count(), prisma.viTri.count(), prisma.phong.count(),
    prisma.datPhong.count(), prisma.binhLuan.count(),
  ]);
  return { NguoiDung, ViTri, Phong, DatPhong, BinhLuan };
}

async function main() {
  if (people.length !== 33 || reviews.length !== 33) {
    throw new Error('Seed phải có đúng 33 người dùng và 33 bình luận mẫu');
  }

  const before = await rowCounts();
  if (before.NguoiDung >= 33 && before.ViTri >= 5 && before.Phong >= 5 &&
      before.DatPhong >= 33 && before.BinhLuan >= 33) {
    console.log('Database đã đủ dữ liệu; giữ nguyên các bản ghi hiện có.');
    console.table(before);
    return;
  }

  const passwordHash = await bcrypt.hash(samplePassword, 10);
  const users = [];
  for (let i = 0; i < people.length; i++) {
    const [name, email, gender] = people[i];
    const prefix = ['090', '091', '093', '038', '070', '081'][i % 6];
    const data = {
      name, email, pass_word: passwordHash,
      phone: prefix + String(3456781 + i * 7919).padStart(7, '0'),
      birth_day: `${1990 + i % 14}-${String(1 + i % 12).padStart(2, '0')}-${String(5 + i % 23).padStart(2, '0')}`,
      gender, role: 'USER',
    };
    users.push(await prisma.nguoiDung.upsert({
      where: { email }, create: data, update: data,
    }));
  }

  const savedLocations = [];
  for (const location of locations) {
    const existing = await prisma.viTri.findFirst({
      where: { ten_vi_tri: location.ten_vi_tri, tinh_thanh: location.tinh_thanh },
    });
    savedLocations.push(existing ?? await prisma.viTri.create({ data: location }));
  }

  const rooms = [];
  for (let i = 0; i < roomNames.length; i++) {
    const location = savedLocations[i];
    const name = roomNames[i];
    const existing = await prisma.phong.findFirst({
      where: { ten_phong: name, ma_vi_tri: location.id },
    });
    rooms.push(existing ?? await prisma.phong.create({
      data: {
        ten_phong: name, khach: 4, phong_ngu: 2, giuong: 2, phong_tam: 1,
        mo_ta: `Chỗ nghỉ thoáng mát gần ${location.ten_vi_tri}, phù hợp cho gia đình và nhóm bạn.`,
        gia_tien: 850000 + i * 120000,
        may_giat: true, ban_la: true, tivi: true, dieu_hoa: true,
        wifi: true, bep: true, do_xe: true, ho_boi: i === 4, ban_ui: false,
        ma_vi_tri: location.id,
      },
    }));
  }

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const room = rooms[i % rooms.length];
    const arrival = new Date(Date.UTC(2027, 0, 1 + i, 14));
    const departure = new Date(arrival.getTime() + 2 * 86400000);
    const booking = await prisma.datPhong.findFirst({
      where: { ma_nguoi_dat: user.id, ma_phong: room.id, ngay_den: arrival },
    });
    if (!booking) {
      await prisma.datPhong.create({
        data: {
          ma_phong: room.id, ngay_den: arrival, ngay_di: departure,
          so_luong_khach: 2, ma_nguoi_dat: user.id,
        },
      });
    }
    const comment = await prisma.binhLuan.findFirst({
      where: {
        ma_phong: room.id, ma_nguoi_binh_luan: user.id,
        noi_dung: reviews[i],
      },
    });
    if (!comment) {
      await prisma.binhLuan.create({
        data: {
          ma_phong: room.id, ma_nguoi_binh_luan: user.id,
          ngay_binh_luan: new Date(Date.UTC(2026, 10, 2, 10, i)),
          noi_dung: reviews[i], sao_binh_luan: i % 2 === 0 ? 5 : 4,
        },
      });
    }
  }

  const after = await rowCounts();
  console.log('Đã tạo hoặc bổ sung dữ liệu mẫu lên database.');
  console.table(after);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
