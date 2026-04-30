import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { RegisterDto } from "./dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { randomBytes } from "crypto";

@Injectable()
export class AuthServices {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly jwtservices: JwtService,
        private readonly mailService: MailerService,
        private readonly configService: ConfigService
    ) { }

    public async register(registerDto: RegisterDto) {
        const { email, password, name, username } = registerDto;

        const userFromDb = await this.usersRepository.findOne({
            where: [{ email }, { username }]
        });
        if (userFromDb) { throw new BadRequestException("User with this email or username already exists") }

        const hashedPassword = await bcrypt.hash(password, 10);
        let newUser = this.usersRepository.create({
            email,
            username,
            password: hashedPassword,
            name,
            varificationToken: randomBytes(32).toString('hex')
        });

        newUser = await this.usersRepository.save(newUser);
        const payload = { id: newUser.id, userType: newUser.userType };
        const token = await this.jwtservices.signAsync(payload);

        const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3001';
        const link = `${baseUrl}/api/users/verify-email/${newUser.varificationToken}`;

        this.mailService.sendMail({
            to: newUser.email,
            from: '"My Store" <no-reply@yourdomain.com>',
            subject: 'Welcome',
            template: 'register',
            context: { link }
        }).catch(mailError => {
            console.error('Background Mail sending failed:', mailError);
        });

        return { message: "user created successfully", accessToken: token, user: newUser }
    }

    public async emailVarification(token: string) {
        const user = await this.usersRepository.findOne({
            where: { varificationToken: token }
        });
        if (!user) { throw new NotFoundException("user not found") }

        user.isAccountVerified = true;
        user.varificationToken = null;
        await this.usersRepository.save(user);

        this.mailService.sendMail({
            to: user.email,
            from: '"My Store" <no-reply@yourdomain.com>',
            subject: 'Verification Success',
            template: 'verify-email',
            context: { userName: user.username }
        }).catch(err => {
            console.error('Verification success mail failed:', err);
        });

        return { message: "Email verified successfully" };
    }

    public async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        const user = await this.usersRepository.findOne({
            where: { email }
        });
        if (!user) { throw new NotFoundException("user not found") }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) { throw new BadRequestException("wrong password") }

        const payload = { id: user.id, userType: user.userType };
        const token = await this.jwtservices.signAsync(payload);
        return { message: "login successful", accessToken: token, user }
    }

    public async sendResetPasswordOTP(id: any) {
        const user = await this.usersRepository.findOne({
            where: { id }
        });
        if (!user) { throw new NotFoundException("user not found") }

        const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3001';
        const link = `${baseUrl}/api/users/reset-password/${user.id}`;

        await this.mailService.sendMail({
            to: user.email,
            from: '"My Store" <no-reply@yourdomain.com>',
            subject: 'Reset Password',
            template: 'reset-password',
            context: { link }
        });
        return { message: "link sent successfully" }
    }

    public async resetPassword(id: any, password: string) {
        const user = await this.usersRepository.findOne({
            where: { id }
        });
        if (!user) { throw new NotFoundException("user not found or reset password link expired") }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await this.usersRepository.save(user);
        return { message: "password reset successfully" }
    }
}
