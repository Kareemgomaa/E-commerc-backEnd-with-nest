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
                const payload = await this.jwtService.verifyAsync(token, {
                    secret: this.configService.get<string>('JWT_SECRET'),
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
            } catch {
                throw new UnauthorizedException('Invalid or expired token');
            }
        }
        throw new UnauthorizedException('Invalid token format');
    }
}