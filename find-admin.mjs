import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const admins = await db.profile.findMany({
  where: { role: 'admin' },
  select: { id: true, email: true, fullName: true, role: true }
})
console.log(JSON.stringify(admins, null, 2))
await db.$disconnect()
