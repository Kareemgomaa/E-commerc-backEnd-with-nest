import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../users.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private usersService: UsersService
    ) { }

    async canActivate(context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();

        const authHeader =
            request.headers.authorization ||
            (request.headers['x-access-token'] as string) ||
            (request.headers['x-auth-token'] as string);

        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing');
        }

        let token: string | undefined;

        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else {
            // fallback لو الـ proxy حذف كلمة Bearer
            token = authHeader;
        }

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const secret = this.configService.get<string>('JWT_SECRET');
            Logger.log(`AuthGuard JWT_SECRET: ${secret ? 'SET' : 'NOT SET'}`, 'AuthGuard');
            const payload = await this.jwtService.verifyAsync(token, { secret });
            request['user'] = payload;
            return true;
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}