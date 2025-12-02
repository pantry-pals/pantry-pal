/* eslint-disable import/no-extraneous-dependencies */
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'), // or process.env.DATABASE_URL
  },
});
