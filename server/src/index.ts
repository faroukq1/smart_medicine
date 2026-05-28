import { app } from './app';
import { env } from './config/env';
import { prisma } from './prisma/client';
import { startPatchWatchdog } from './watchdog/patchWatchdog';

async function main() {
  await prisma.$connect();
  console.log('✅ Database connected');

  startPatchWatchdog();
  console.log('🔍 Patch watchdog started (3s timeout)');

  app.listen(Number(env.PORT), () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
