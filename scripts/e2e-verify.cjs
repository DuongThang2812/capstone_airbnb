/* Run from the project root: node scripts/e2e-verify.cjs [report.md] */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:8080';
const reportPath = path.resolve(process.argv[2] || 'e2e-report.md');
const statePath = path.join(__dirname, '.e2e-state.json');
const imageDir = path.resolve('public/img');
const password = '123456';
const marker = '.airbnbqa26@gmail.com';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lZkAAAAASUVORK5CYII=', 'base64');
const results = new Map();
let state = { users: [], locations: [], rooms: [], images: [] };

const people = [
  ['Nguyễn Minh Tuấn', 'minhtuan.nguyen95'],
  ['Trần Ngọc Lan Anh', 'lananh.tran98'],
  ['Lê Hoàng Nam', 'hoangnam.le96'],
  ['Phạm Thị Thu Hà', 'thuha.pham97'],
  ['Võ Quốc Bảo', 'quocbao.vo94'],
  ['Đặng Khánh Linh', 'khanhlinh.dang99'],
  ['Bùi Đức Anh', 'ducanh.bui93'],
  ['Hoàng Phương Thảo', 'phuongthao.hoang00'],
  ['Đỗ Quang Huy', 'quanghuy.do92'],
  ['Ngô Thanh Trúc', 'thanhtruc.ngo01'],
  ['Huỳnh Gia Hân', 'giahan.huynh02'],
  ['Phan Nhật Minh', 'nhatminh.phan95'],
  ['Vũ Thị Bích Ngọc', 'bichngoc.vu98'],
  ['Mai Thành Đạt', 'thanhdat.mai96'],
  ['Trịnh Mỹ Duyên', 'myduyen.trinh99'],
  ['Hồ Anh Khoa', 'anhkhoa.ho93'],
  ['Dương Thị Thanh Mai', 'thanhmai.duong97'],
  ['Nguyễn Hải Đăng', 'haidang.nguyen00'],
  ['Trần Bảo Châu', 'baochau.tran01'],
  ['Lê Đức Phúc', 'ducphuc.le94'],
  ['Phạm Ngọc Ánh', 'ngocanh.pham98'],
  ['Võ Minh Khôi', 'minhkhoi.vo02'],
  ['Đặng Thùy Dương', 'thuyduong.dang96'],
  ['Bùi Quỳnh Như', 'quynhnhu.bui99'],
  ['Hoàng Tuấn Kiệt', 'tuankiet.hoang95'],
  ['Đỗ Thảo Vy', 'thaovy.do03'],
  ['Ngô Thành Luân', 'thanhluan.ngo97'],
  ['Huỳnh Diệu Linh', 'dieulinh.huynh00'],
  ['Phan Quốc Việt', 'quocviet.phan92'],
  ['Vũ Hồng Nhung', 'hongnhung.vu98'],
  ['Mai Khánh Duy', 'khanhduy.mai01'],
  ['Trịnh Thu Trang', 'thutrang.trinh96'],
  ['Hồ Minh Châu', 'minhchau.ho02'],
];

const places = [
  { tenViTri: 'Phố cổ Hội An', tinhThanh: 'Quảng Nam', quocGia: 'Việt Nam' },
  { tenViTri: 'Bãi Sau', tinhThanh: 'Vũng Tàu', quocGia: 'Việt Nam' },
  { tenViTri: 'Hồ Tuyền Lâm', tinhThanh: 'Đà Lạt', quocGia: 'Việt Nam' },
  { tenViTri: 'Bản Cát Cát', tinhThanh: 'Sa Pa', quocGia: 'Việt Nam' },
  { tenViTri: 'Bãi Sao', tinhThanh: 'Phú Quốc', quocGia: 'Việt Nam' },
];

const roomNames = [
  'An Bàng Beach Villa',
  'Căn hộ Gió Biển Vũng Tàu',
  'The Chill Homestay Đà Lạt',
  'Mây Núi Bungalow Sa Pa',
  'Bãi Sao Sunset Villa',
];

const comments = [
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

function saveState() {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function remember(kind, value) {
  state[kind].push(value);
  saveState();
}

async function cleanPreviousRun() {
  if (!fs.existsSync(statePath)) return;
  const old = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  if (old.rooms?.length) await prisma.phong.deleteMany({
    where: { id: { in: old.rooms }, ten_phong: { in: [...roomNames, 'Căn hộ Ngọn Hải Đăng Vũng Tàu'] } },
  });
  if (old.locations?.length) await prisma.viTri.deleteMany({
    where: { id: { in: old.locations }, ten_vi_tri: { in: [...places.map(x => x.tenViTri), 'Bến Ninh Kiều'] } },
  });
  if (old.users?.length) await prisma.nguoiDung.deleteMany({
    where: { id: { in: old.users }, email: { endsWith: marker } },
  });
  for (const image of old.images || []) {
    const file = path.resolve(imageDir, path.basename(image));
    if (file.startsWith(imageDir + path.sep) && fs.existsSync(file)) fs.unlinkSync(file);
  }
  fs.unlinkSync(statePath);
}

function person(index) {
  const [name, stem] = people[index];
  const prefix = ['090', '091', '093', '038', '070', '081'][index % 6];
  return {
    name,
    email: `${stem}${marker}`,
    password,
    phone: prefix + String(3456781 + index * 7919).padStart(7, '0'),
    birthday: `${1990 + index % 14}-${String(1 + index % 12).padStart(2, '0')}-${String(5 + index % 23).padStart(2, '0')}`,
    gender: index % 2 === 0,
  };
}

function roomBody(index, locationId) {
  return {
    tenPhong: roomNames[index], khach: 4, phongNgu: 2, giuong: 2, phongTam: 1,
    moTa: `Chỗ nghỉ thoáng mát gần ${places[index].tenViTri}, thích hợp cho gia đình và nhóm bạn.`,
    giaTien: 850000 + index * 120000,
    mayGiat: true, banLa: true, tivi: true, dieuHoa: true, wifi: true,
    bep: true, doXe: true, hoBoi: index === 4, banUi: false, maViTri: locationId,
  };
}

function uploadForm() {
  const form = new FormData();
  form.append('formFile', new Blob([png], { type: 'image/png' }), 'qa-room.png');
  return form;
}

function assertPublicUser(user) {
  assert.equal(Object.hasOwn(user, 'pass_word'), false);
  assert.equal(Object.hasOwn(user, 'password'), false);
}

async function verify(method, endpoint, url = endpoint, options = {}, dbCheck = async () => {}) {
  const key = `${method} ${endpoint}`;
  const row = results.get(key) || { method, endpoint, calls: 0, http: '-', statusCode: '-', db: 'PASS' };
  results.set(key, row);
  row.calls++;
  try {
    const headers = {};
    if (options.token) headers.Authorization = `Bearer ${options.token}`;
    let body;
    if (options.form) body = options.form;
    else if (options.body !== undefined) {
      body = JSON.stringify(options.body);
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(new URL(url, baseUrl), { method, headers, body });
    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); } catch { throw new Error(`Invalid JSON: ${raw.slice(0, 160)}`); }
    row.http = response.status;
    row.statusCode = data.statusCode;
    assert.equal(response.status, 200, `${key}: HTTP ${response.status}: ${data.message}`);
    assert.equal(data.statusCode, 200, `${key}: JSON statusCode`);
    assert.equal(data.message, 'Thành công', `${key}: message`);
    assert.ok(Object.hasOwn(data, 'content'), `${key}: missing content`);
    await dbCheck(data.content);
    return data.content;
  } catch (error) {
    row.db = 'FAIL';
    row.error = error.message;
    throw new Error(`${key}: ${error.message}`, { cause: error });
  }
}

function markdownReport(counts, error) {
  const rows = [...results.values()];
  const passed = rows.filter(row => row.db === 'PASS' && row.http === 200 && row.statusCode === 200);
  const lines = [
    '# Airbnb API E2E verification', '',
    `Result: **${passed.length}/${rows.length} API routes PASS**${error ? `; stopped by: ${error.message}` : ''}.`,
    `Base URL: \`${baseUrl}\``, '',
    '| Method | Endpoint | Calls | HTTP | JSON statusCode | DB |',
    '|---|---|---:|---:|---:|---|',
    ...rows.map(row => `| ${row.method} | \`${row.endpoint}\` | ${row.calls} | ${row.http} | ${row.statusCode} | ${row.db} |`),
    '', '## Database row counts', '',
    '| Table | Rows |', '|---|---:|',
    ...Object.entries(counts || {}).map(([table, count]) => `| ${table} | ${count} |`),
    '',
  ];
  if (error) lines.push('## Error', '', '```text', error.stack || error.message, '```', '');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
  console.table(rows.map(({ method, endpoint, calls, http, statusCode, db }) => ({ method, endpoint, calls, http, statusCode, db })));
  if (counts) console.table(counts);
  console.log(`Report: ${reportPath}`);
}

async function counts() {
  const [NguoiDung, ViTri, Phong, DatPhong, BinhLuan] = await Promise.all([
    prisma.nguoiDung.count(), prisma.viTri.count(), prisma.phong.count(),
    prisma.datPhong.count(), prisma.binhLuan.count(),
  ]);
  return { NguoiDung, ViTri, Phong, DatPhong, BinhLuan };
}

async function verifySwaggerCoverage() {
  const response = await fetch(new URL('/swagger-json', baseUrl));
  assert.equal(response.status, 200, 'Swagger JSON must be available');
  const spec = await response.json();
  const swaggerRoutes = new Set();
  for (const [route, operations] of Object.entries(spec.paths)) {
    for (const method of Object.keys(operations)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        swaggerRoutes.add(`${method.toUpperCase()} ${route.replace(/\{([^}]+)\}/g, ':$1')}`);
      }
    }
  }
  const testedRoutes = new Set([...results.keys()].map(key => key.replace(/\?id=:id$/, '')));
  assert.equal(swaggerRoutes.size, 36, 'Swagger should declare 36 routes');
  assert.deepEqual([...testedRoutes].sort(), [...swaggerRoutes].sort(), 'Every Swagger route must be tested');
}

async function main() {
  await cleanPreviousRun();
  saveState();
  assert.equal(people.length, 33);
  assert.equal(comments.length, 33);
  const users = [];
  const tokens = [];

  for (let i = 0; i < 33; i++) {
    const p = person(i);
    const method = i < 17 ? '/api/auth/signup' : '/api/users';
    const user = await verify('POST', method, method, { body: p }, async content => {
      assertPublicUser(content);
      const db = await prisma.nguoiDung.findUnique({ where: { id: content.id } });
      assert.equal(db.name, p.name);
      assert.equal(db.email, p.email);
      assert.equal(db.phone, p.phone);
      assert.equal(db.birth_day, p.birthday);
      assert.equal(db.gender, p.gender);
      assert.notEqual(db.pass_word, p.password);
    });
    users.push(user);
    remember('users', user.id);
  }

  for (let i = 0; i < 33; i++) {
    const p = person(i);
    const signin = await verify('POST', '/api/auth/signin', '/api/auth/signin',
      { body: { email: p.email, password } }, content => {
        assertPublicUser(content.user);
        assert.equal(content.user.id, users[i].id);
        assert.ok(typeof content.token === 'string' && content.token.length > 20);
      });
    tokens.push(signin.token);
  }
  assert.equal(new Set(tokens).size, 33, 'Each account needs its own JWT');
  const userIds = users.map(user => user.id);
  await verify('GET', '/api/users', '/api/users', {}, async content => {
    const db = await prisma.nguoiDung.findMany({ where: { id: { in: userIds } } });
    assert.equal(db.length, 33);
    for (const user of users) assert.ok(content.some(item => item.id === user.id));
    content.forEach(assertPublicUser);
  });
  await verify('GET', '/api/users/phan-trang-tim-kiem',
    '/api/users/phan-trang-tim-kiem?pageIndex=1&pageSize=10&keyword=Nguyễn', {}, async content => {
      const count = await prisma.nguoiDung.count({ where: { name: { contains: 'Nguyễn' } } });
      assert.equal(content.totalRow, count);
      assert.equal(content.data.length, Math.min(count, 10));
      content.data.forEach(assertPublicUser);
    });
  await verify('GET', '/api/users/search/:TenNguoiDung', '/api/users/search/Minh', {}, async content => {
    const db = await prisma.nguoiDung.findMany({ where: { name: { contains: 'Minh' } } });
    assert.deepEqual(content.map(item => item.id), db.map(item => item.id));
    content.forEach(assertPublicUser);
  });
  await verify('GET', '/api/users/:id', `/api/users/${users[0].id}`, {}, async content => {
    const db = await prisma.nguoiDung.findUnique({ where: { id: users[0].id } });
    assert.equal(content.email, db.email);
    assertPublicUser(content);
  });
  const newPhone = '0987654321';
  await verify('PUT', '/api/users/:id', `/api/users/${users[0].id}`, { body: { phone: newPhone } }, async content => {
    assert.equal(content.phone, newPhone);
    assert.equal((await prisma.nguoiDung.findUnique({ where: { id: users[0].id } })).phone, newPhone);
  });
  await verify('POST', '/api/users/upload-avatar', '/api/users/upload-avatar',
    { token: tokens[0], form: uploadForm() }, async content => {
      const db = await prisma.nguoiDung.findUnique({ where: { id: users[0].id } });
      assert.equal(content.avatar, db.avatar);
      assert.match(db.avatar, /^\/public\/img\/[^/]+\.png$/);
      const file = path.join(imageDir, path.basename(db.avatar));
      assert.ok(fs.existsSync(file));
      assert.deepEqual(fs.readFileSync(file), png);
      remember('images', db.avatar);
    });
  const temporary = await verify('POST', '/api/users', '/api/users',
    { body: { ...person(32), name: 'Lâm Quốc Hưng', email: `quochung.lam91${marker}`, phone: '0962837451' } },
    async content => assert.ok(await prisma.nguoiDung.findUnique({ where: { id: content.id } })));
  remember('users', temporary.id);
  await verify('DELETE', '/api/users?id=:id', `/api/users?id=${temporary.id}`, {}, async () => {
    assert.equal(await prisma.nguoiDung.findUnique({ where: { id: temporary.id } }), null);
    assert.equal(await prisma.nguoiDung.count({ where: { id: { in: userIds } } }), 33);
  });

  const locations = [];
  for (const place of places) {
    const location = await verify('POST', '/api/vi-tri', '/api/vi-tri',
      { token: tokens[0], body: place }, async content => {
        const db = await prisma.viTri.findUnique({ where: { id: content.id } });
        assert.equal(db.ten_vi_tri, place.tenViTri);
        assert.equal(db.tinh_thanh, place.tinhThanh);
        assert.equal(db.quoc_gia, place.quocGia);
      });
    locations.push(location);
    remember('locations', location.id);
  }
  await verify('GET', '/api/vi-tri', '/api/vi-tri', {}, async content => {
    const db = await prisma.viTri.findMany({ where: { id: { in: locations.map(x => x.id) } } });
    assert.equal(db.length, 5);
    for (const place of locations) assert.ok(content.some(x => x.id === place.id));
  });
  await verify('GET', '/api/vi-tri/phan-trang-tim-kiem',
    '/api/vi-tri/phan-trang-tim-kiem?pageIndex=1&pageSize=10&keyword=Hồ', {}, async content => {
      const count = await prisma.viTri.count({ where: { ten_vi_tri: { contains: 'Hồ' } } });
      assert.equal(content.totalRow, count);
    });
  await verify('GET', '/api/vi-tri/:id', `/api/vi-tri/${locations[0].id}`, {}, async content => {
    assert.equal(content.tenViTri, (await prisma.viTri.findUnique({ where: { id: locations[0].id } })).ten_vi_tri);
  });
  await verify('PUT', '/api/vi-tri/:id', `/api/vi-tri/${locations[0].id}`,
    { token: tokens[0], body: { tinhThanh: 'Thành phố Hội An' } }, async content => {
      assert.equal(content.tinhThanh, 'Thành phố Hội An');
      assert.equal((await prisma.viTri.findUnique({ where: { id: locations[0].id } })).tinh_thanh, content.tinhThanh);
    });
  await verify('POST', '/api/vi-tri/upload-hinh-vitri',
    `/api/vi-tri/upload-hinh-vitri?maViTri=${locations[0].id}`,
    { token: tokens[0], form: uploadForm() }, async content => {
      const db = await prisma.viTri.findUnique({ where: { id: locations[0].id } });
      assert.equal(db.hinh_anh, content.hinhAnh);
      assert.ok(fs.existsSync(path.join(imageDir, path.basename(db.hinh_anh))));
      remember('images', db.hinh_anh);
    });
  const tempLocation = await verify('POST', '/api/vi-tri', '/api/vi-tri',
    { token: tokens[0], body: { tenViTri: 'Bến Ninh Kiều', tinhThanh: 'Cần Thơ', quocGia: 'Việt Nam' } },
    async content => assert.ok(await prisma.viTri.findUnique({ where: { id: content.id } })));
  remember('locations', tempLocation.id);
  await verify('DELETE', '/api/vi-tri/:id', `/api/vi-tri/${tempLocation.id}`,
    { token: tokens[0] }, async () => assert.equal(await prisma.viTri.findUnique({ where: { id: tempLocation.id } }), null));

  const rooms = [];
  for (let i = 0; i < 5; i++) {
    const body = roomBody(i, locations[i].id);
    const room = await verify('POST', '/api/phong-thue', '/api/phong-thue',
      { token: tokens[0], body }, async content => {
        const db = await prisma.phong.findUnique({ where: { id: content.id } });
        assert.equal(db.ten_phong, body.tenPhong);
        assert.equal(db.ma_vi_tri, body.maViTri);
        assert.equal(db.gia_tien, body.giaTien);
      });
    rooms.push(room);
    remember('rooms', room.id);
  }
  await verify('GET', '/api/phong-thue', '/api/phong-thue', {}, async content => {
    assert.equal(await prisma.phong.count({ where: { id: { in: rooms.map(x => x.id) } } }), 5);
    for (const room of rooms) assert.ok(content.some(x => x.id === room.id));
  });
  await verify('GET', '/api/phong-thue/lay-phong-theo-vi-tri',
    `/api/phong-thue/lay-phong-theo-vi-tri?maViTri=${locations[0].id}`, {}, async content => {
      const db = await prisma.phong.findMany({ where: { ma_vi_tri: locations[0].id }, orderBy: { id: 'asc' } });
      assert.deepEqual(content.map(x => x.id), db.map(x => x.id));
    });
  await verify('GET', '/api/phong-thue/phan-trang-tim-kiem',
    '/api/phong-thue/phan-trang-tim-kiem?pageIndex=1&pageSize=10&keyword=Villa', {}, async content => {
      assert.equal(content.totalRow, await prisma.phong.count({ where: { ten_phong: { contains: 'Villa' } } }));
    });
  await verify('GET', '/api/phong-thue/:id', `/api/phong-thue/${rooms[0].id}`, {}, async content => {
    assert.equal(content.tenPhong, (await prisma.phong.findUnique({ where: { id: rooms[0].id } })).ten_phong);
  });
  await verify('PUT', '/api/phong-thue/:id', `/api/phong-thue/${rooms[0].id}`,
    { token: tokens[0], body: { giaTien: 990000 } }, async content => {
      assert.equal(content.giaTien, 990000);
      assert.equal((await prisma.phong.findUnique({ where: { id: rooms[0].id } })).gia_tien, 990000);
    });
  await verify('POST', '/api/phong-thue/upload-hinh-phong',
    `/api/phong-thue/upload-hinh-phong?maPhong=${rooms[0].id}`,
    { token: tokens[0], form: uploadForm() }, async content => {
      const db = await prisma.phong.findUnique({ where: { id: rooms[0].id } });
      assert.equal(db.hinh_anh, content.hinhAnh);
      assert.ok(fs.existsSync(path.join(imageDir, path.basename(db.hinh_anh))));
      remember('images', db.hinh_anh);
    });
  const tempRoom = await verify('POST', '/api/phong-thue', '/api/phong-thue',
    { token: tokens[0], body: { ...roomBody(1, locations[1].id), tenPhong: 'Căn hộ Ngọn Hải Đăng Vũng Tàu' } },
    async content => assert.ok(await prisma.phong.findUnique({ where: { id: content.id } })));
  remember('rooms', tempRoom.id);
  await verify('DELETE', '/api/phong-thue/:id', `/api/phong-thue/${tempRoom.id}`,
    { token: tokens[0] }, async () => assert.equal(await prisma.phong.findUnique({ where: { id: tempRoom.id } }), null));

  const bookings = [];
  for (let i = 0; i < 33; i++) {
    const checkin = new Date(Date.UTC(2027, 0, 1 + i, 14));
    const checkout = new Date(checkin.getTime() + 2 * 86400000);
    const body = { maPhong: rooms[i % 5].id, ngayDen: checkin.toISOString(),
      ngayDi: checkout.toISOString(), soLuongKhach: 2, maNguoiDat: users[i].id };
    const booking = await verify('POST', '/api/dat-phong', '/api/dat-phong', { body }, async content => {
      const db = await prisma.datPhong.findUnique({ where: { id: content.id } });
      assert.equal(db.ma_phong, body.maPhong);
      assert.equal(db.ma_nguoi_dat, body.maNguoiDat);
      assert.equal(db.so_luong_khach, 2);
      assert.equal(db.ngay_den.toISOString(), body.ngayDen);
      assert.equal(db.ngay_di.toISOString(), body.ngayDi);
    });
    bookings.push(booking);
  }
  const bookingIds = bookings.map(x => x.id);
  await verify('GET', '/api/dat-phong', '/api/dat-phong', {}, async content => {
    assert.equal(await prisma.datPhong.count({ where: { id: { in: bookingIds } } }), 33);
    for (const booking of bookings) assert.ok(content.some(x => x.id === booking.id));
  });
  await verify('GET', '/api/dat-phong/:id', `/api/dat-phong/${bookings[0].id}`, {}, async content => {
    assert.equal(content.maNguoiDat, (await prisma.datPhong.findUnique({ where: { id: bookings[0].id } })).ma_nguoi_dat);
  });
  await verify('PUT', '/api/dat-phong/:id', `/api/dat-phong/${bookings[0].id}`,
    { body: { soLuongKhach: 3 } }, async content => {
      assert.equal(content.soLuongKhach, 3);
      assert.equal((await prisma.datPhong.findUnique({ where: { id: bookings[0].id } })).so_luong_khach, 3);
    });
  await verify('GET', '/api/dat-phong/lay-theo-nguoi-dung/:MaNguoiDung',
    `/api/dat-phong/lay-theo-nguoi-dung/${users[0].id}`, {}, async content => {
      const db = await prisma.datPhong.findMany({ where: { ma_nguoi_dat: users[0].id } });
      assert.deepEqual(content.map(x => x.id), db.map(x => x.id));
    });
  const tempBooking = await verify('POST', '/api/dat-phong', '/api/dat-phong',
    { body: { maPhong: rooms[0].id, ngayDen: '2027-04-10T14:00:00.000Z',
      ngayDi: '2027-04-12T11:00:00.000Z', soLuongKhach: 2, maNguoiDat: users[0].id } },
    async content => assert.ok(await prisma.datPhong.findUnique({ where: { id: content.id } })));
  await verify('DELETE', '/api/dat-phong/:id', `/api/dat-phong/${tempBooking.id}`, {},
    async () => assert.equal(await prisma.datPhong.findUnique({ where: { id: tempBooking.id } }), null));

  const reviews = [];
  for (let i = 0; i < 33; i++) {
    const body = { maPhong: rooms[i % 5].id, maNguoiBinhLuan: users[i].id,
      noiDung: comments[i], saoBinhLuan: i % 2 === 0 ? 5 : 4 };
    const review = await verify('POST', '/api/binh-luan', '/api/binh-luan',
      { token: tokens[i], body }, async content => {
        const db = await prisma.binhLuan.findUnique({ where: { id: content.id } });
        assert.equal(db.ma_phong, body.maPhong);
        assert.equal(db.ma_nguoi_binh_luan, body.maNguoiBinhLuan);
        assert.equal(db.noi_dung, body.noiDung);
        assert.equal(db.sao_binh_luan, body.saoBinhLuan);
        assert.ok(db.ngay_binh_luan instanceof Date);
      });
    reviews.push(review);
  }
  const reviewIds = reviews.map(x => x.id);
  await verify('GET', '/api/binh-luan', '/api/binh-luan', {}, async content => {
    assert.equal(await prisma.binhLuan.count({ where: { id: { in: reviewIds } } }), 33);
    for (const review of reviews) assert.ok(content.some(x => x.id === review.id));
  });
  await verify('GET', '/api/binh-luan/lay-binh-luan-theo-phong/:MaPhong',
    `/api/binh-luan/lay-binh-luan-theo-phong/${rooms[0].id}`, {}, async content => {
      const db = await prisma.binhLuan.findMany({ where: { ma_phong: rooms[0].id }, include: { NguoiDung: true } });
      assert.equal(content.length, db.length);
      for (const row of db) {
        const item = content.find(x => x.id === row.id);
        assert.equal(item.tenNguoiBinhLuan, row.NguoiDung.name);
        assert.equal(item.avatar, row.NguoiDung.avatar);
      }
    });
  await verify('PUT', '/api/binh-luan/:id', `/api/binh-luan/${reviews[0].id}`,
    { token: tokens[0], body: { noiDung: 'Chủ nhà rất chu đáo, gia đình tôi đã có kỳ nghỉ tuyệt vời.', saoBinhLuan: 5 } },
    async content => {
      assert.equal(content.saoBinhLuan, 5);
      assert.equal((await prisma.binhLuan.findUnique({ where: { id: reviews[0].id } })).noi_dung, content.noiDung);
    });
  const tempReview = await verify('POST', '/api/binh-luan', '/api/binh-luan',
    { token: tokens[0], body: { maPhong: rooms[0].id, maNguoiBinhLuan: users[0].id,
      noiDung: 'Chuyến nghỉ ngắn rất thoải mái.', saoBinhLuan: 4 } },
    async content => assert.ok(await prisma.binhLuan.findUnique({ where: { id: content.id } })));
  await verify('DELETE', '/api/binh-luan/:id', `/api/binh-luan/${tempReview.id}`,
    { token: tokens[0] }, async () => assert.equal(await prisma.binhLuan.findUnique({ where: { id: tempReview.id } }), null));

  assert.equal(await prisma.nguoiDung.count({ where: { id: { in: userIds } } }), 33);
  assert.equal(await prisma.datPhong.count({ where: { id: { in: bookingIds } } }), 33);
  assert.equal(await prisma.binhLuan.count({ where: { id: { in: reviewIds } } }), 33);
  assert.equal(results.size, 36, 'All 36 distinct routes must run');
  assert.ok([...results.values()].every(row => row.db === 'PASS'));
  await verifySwaggerCoverage();
  markdownReport(await counts());
  console.log('PASS: 36/36 routes, 33 users, 33 bookings, 33 comments.');
}

main().catch(async error => {
  console.error(error);
  let currentCounts;
  try { currentCounts = await counts(); } catch { currentCounts = null; }
  markdownReport(currentCounts, error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
