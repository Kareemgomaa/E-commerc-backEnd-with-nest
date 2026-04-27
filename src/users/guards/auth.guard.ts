import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
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
                const payload = await this.jwtService.verifyAsync(token, {
                    secret: this.configService.get<string>('JWT_SECRET'),
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
