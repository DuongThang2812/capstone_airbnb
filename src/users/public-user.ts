import { NguoiDung } from '@prisma/client';

export function publicUser(user: NguoiDung) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    birthday: user.birth_day,
    gender: user.gender,
    role: user.role,
    avatar: user.avatar,
  };
}
