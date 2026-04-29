import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, RequestTimeoutException } from "@nestjs/common";
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
        private readonly configService: ConfigService,
        private readonly mailService: MailerService,
        private readonly config: ConfigService
    ) { }

    public async register(registerDto: RegisterDto) {
        const { email, password, name, username } = registerDto

        const userFromDb = await this.usersRepository.findOne({
            where: [{ email }, { username }]
        });
        if (userFromDb) { throw new BadRequestException("User with this email or username already exists") }

        const hashedPassword = await bcrypt.hash(password, 10)
        let newUser = await this.usersRepository.create({
            email,
            username,
            password: hashedPassword,
            name,
            varificationToken: randomBytes(32).toString('hex')
        })
        newUser = await this.usersRepository.save(newUser)
        const payload = { id: newUser.id, userType: newUser.userType };
        const token = await this.jwtservices.signAsync(payload);
        const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3001';
        const link = `${baseUrl}/api/users/verify-email/${newUser.varificationToken}`;
        try {
            await this.mailService.sendMail({
                to: newUser.email,
                from: '"My Store" <no-reply@yourdomain.com>',
                subject: 'Welcom',
                template: 'register',
                context: {
                    link
                }

            })
        } catch (mailError) {
            // نسجل الخطأ في الـ Logs لنعرف السبب الحقيقي (Authentication failure, Port blocked, etc.)
            console.error('Mail sending failed:', mailError);
            // يفضل هنا عدم رمي Exception إذا أردت أن يكمل المستخدم عملية التسجيل بالرغم من فشل الإيميل
        }
        return { message: "user created successfully", accessToken: token, user: newUser }
    }

    public async emailVarification(token: string) {
        const user = await this.usersRepository.findOne({
            where: { varificationToken: token }
        })
        if (!user) { throw new NotFoundException("user not found") }
        if (user.varificationToken !== token) { throw new BadRequestException("invalid token") }
        user.isAccountVerified = true;
        user.varificationToken = null;
        const email = user.email
        await this.usersRepository.save(user);
        const userName = user.username
        try {
            await this.mailService.sendMail({
                to: email,
                from: '"My Store" <no-reply@yourdomain.com>',
                subject: 'vrifcation',
                template: 'verify-email',
                context: {
                    userName
                }
            })
        } catch (error) {
            console.log(error);
            throw new RequestTimeoutException();
        }
    }

    public async login(loginDto: LoginDto) {
        const { email, password } = loginDto
        const user = await this.usersRepository.findOne({
            where: { email }
        })
        if (!user) { throw new NotFoundException("user not found") }
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) { throw new BadRequestException("wrong password") }
        const payload = { id: user.id, userType: user.userType };
        const token = await this.jwtservices.signAsync(payload);
        return { message: "login successful", accessToken: token, user }
    }
}