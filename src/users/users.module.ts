import { UsersService } from './users.service';
import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthServices } from './auth.service';
import { MailModule } from 'src/mail/mail.module';


@Module({
    controllers: [UsersController],
    providers: [UsersService, AuthServices],
    exports: [UsersService],
    imports: [
        MailModule,
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            global: true,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    secret: config.get<string>('JWT_SECRET'),
                    signOptions: {
                        expiresIn: config.get<any>('JWT_EXPIRES_IN')
                    }
                }
            }
        }),

    ]
})
export class UsersModule { }
