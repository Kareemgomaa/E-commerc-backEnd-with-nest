import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../users.service';

@Injectable()
export class AuthRolesGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
        private readonly usersService: UsersService
    ) { }

    async canActivate(context: ExecutionContext) {
        const roles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

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
            token = authHeader;
        }

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        let payload: any;
        try {
            const secret = this.configService.get<string>('JWT_SECRET');
            payload = await this.jwtService.verifyAsync(token, { secret });
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        const user = await this.usersService.getCurrentUser(payload.id);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        request['user'] = user;

        if (!roles || roles.length === 0) {
            return true;
        }

        return roles.includes(user.userType);
    }
}