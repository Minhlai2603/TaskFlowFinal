/**
 * Migration Script: Tạo personal workspace cho users hiện có mà chưa có workspace ADMIN
 *
 * Chạy: npx ts-node -r tsconfig-paths/register src/scripts/migrate-personal-workspaces.ts
 *
 * Script này an toàn để chạy nhiều lần (idempotent) — chỉ tạo workspace cho
 * những user thực sự chưa có workspace ADMIN.
 */

import prisma from '../lib/prisma';

async function migratePersonalWorkspaces() {
  console.log('🚀 Bắt đầu migration: Tạo personal workspace cho existing users...\n');

  // Tìm tất cả users không có membership với role ADMIN ở bất kỳ workspace nào
  const allUsers = await prisma.user.findMany({
    include: {
      workspace_members: {
        where: { role: 'ADMIN' },
      },
    },
  });

  const usersWithoutPersonalWorkspace = allUsers.filter(
    (u) => u.workspace_members.length === 0
  );

  console.log(`📊 Tổng số users: ${allUsers.length}`);
  console.log(`⚠️  Users chưa có personal workspace: ${usersWithoutPersonalWorkspace.length}\n`);

  if (usersWithoutPersonalWorkspace.length === 0) {
    console.log('✅ Tất cả users đã có personal workspace. Không cần migration.');
    return;
  }

  let created = 0;
  let failed = 0;

  for (const user of usersWithoutPersonalWorkspace) {
    try {
      await prisma.workspace.create({
        data: {
          name: `${user.name}'s Workspace`,
          created_by: user.id,
          members: {
            create: {
              user_id: user.id,
              role: 'ADMIN',
            },
          },
        },
      });
      console.log(`✅ Đã tạo personal workspace cho: ${user.name} (${user.email})`);
      created++;
    } catch (error) {
      console.error(`❌ Lỗi khi tạo workspace cho ${user.email}:`, error);
      failed++;
    }
  }

  console.log(`\n📋 Kết quả migration:`);
  console.log(`   ✅ Thành công: ${created}`);
  console.log(`   ❌ Thất bại: ${failed}`);
  console.log('\n🎉 Migration hoàn tất!');
}

migratePersonalWorkspaces()
  .catch((e) => {
    console.error('Migration thất bại:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
