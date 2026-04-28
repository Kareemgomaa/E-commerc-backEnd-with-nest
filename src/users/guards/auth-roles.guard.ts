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
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing');
        }

        const [type, token] = authHeader.split(' ');
        if (token && type === 'Bearer') {
            try {
                const secret = this.configService.get('JWT_SECRET');
                console.log('AuthRolesGuard JWT_SECRET:', secret ? 'SET' : 'NOT SET', secret); // Debugging log
                const payload = await this.jwtService.verifyAsync(token, {
                    secret: secret,
                });

                const user = await this.usersService.getCurrentUser(payload.id);
                if (!user) {
                    throw new UnauthorizedException('User not found');
                }

                request['user'] = user;

                // If no roles are defined on the route, allow access to any authenticated user
                if (!roles || roles.length === 0) {
                    return true;
                }

                return roles.includes(user.userType);
            } catch (error) {
                console.error('AuthRolesGuard token verification failed:', error); // Debugging log
            }
        }
        throw new UnauthorizedException('Invalid token format');
    }
}