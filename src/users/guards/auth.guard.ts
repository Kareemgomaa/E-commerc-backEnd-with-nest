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

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        const authHeader =
            request.headers.authorization ||
            (request.headers['x-access-token'] as string) ||
            (request.headers['x-auth-token'] as string);

        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing');
        }

        let token: string;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else {
            token = authHeader;
        }

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            console.log('User ID from Token:', payload.id);
            const user = await this.usersService.getCurrentUser(payload.id);
            if (!user) {
                throw new UnauthorizedException('User not found or account deleted');
            }

            request['user'] = user;

            return true;
        } catch (error) {
            console.log(error);

            Logger.error(`JWT Verification Error: `, 'AuthGuard');
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}