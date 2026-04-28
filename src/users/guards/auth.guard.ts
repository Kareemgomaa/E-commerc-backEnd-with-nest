import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../users.service'; // Assuming you might need UsersService for user lookup


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private usersService: UsersService // Assuming you might need UsersService

    ) { }
    async canActivate(context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing');
        }
        const [type, token] = authHeader.split(' ');
        if (token && type === 'Bearer') {
            try {
                const secret = this.configService.get('JWT_SECRET');
                Logger.log(`AuthGuard JWT_SECRET: ${secret ? 'SET' : 'NOT SET'}`, 'AuthGuard'); // Debugging log
                const payload = await this.jwtService.verifyAsync(token, {
                    secret: secret,
                });
                request['user'] = payload;
                return true;
            } catch {
                throw new UnauthorizedException('Invalid or expired token');
            }
        }
        throw new UnauthorizedException('Invalid token format');
    }
}
