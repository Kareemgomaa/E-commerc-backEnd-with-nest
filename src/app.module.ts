import { Module } from '@nestjs/common';
import { ProductModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/product.entity';
import { User } from './users/users.entity';
import { Review } from './reviews/reviews.entity';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { LoggerINtercepter } from './utils/intercepter/logger.intercepter';
import { uploadModule } from './uploads/uploads.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ProductModule,
    UsersModule,
    ReviewsModule,
    uploadModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = process.env.NODE_ENV === 'production';
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST') || 'localhost',
          port: config.get<number>('DB_PORT') || 5432,
          username: config.get<string>('DB_USERNAME') || 'postgres',
          password: String(config.get('DB_PASSWORD') || ''),
          database: config.get<string>('DB_DATABASE'),
          entities: [Product, User, Review],
          synchronize: true,
          // ✅ SSL دايماً شغال في production بغض النظر عن أي env variable
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    MailModule,
  ],
  providers: [
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggerINtercepter,
    },
  ],
})
export class AppModule { }