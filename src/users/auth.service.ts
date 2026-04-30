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
        private readonly mailService: MailerService,
        private readonly configService: ConfigService
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

        // استخدام رابط ديناميكي بناءً على بيئة التشغيل
        const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3001';
        const link = `${baseUrl}/api/users/verify-email/${newUser.varificationToken}`;

        // إرسال الإيميل بدون await حتى لا ينتظر الـ API رد سيرفر الإيميل
        this.mailService.sendMail({
            to: newUser.email,
            from: '"My Store" <no-reply@yourdomain.com>',
            subject: 'Welcom',
            template: 'register',
            context: {
                link
            }
        }).catch(mailError => {
            // نسجل الخطأ فقط في السجلات دون تعطيل عملية التسجيل
            console.error('Background Mail sending failed:', mailError);
        });

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

        // إرسال إيميل التأكيد أيضاً في الخلفية
        this.mailService.sendMail({
            to: email,
            from: '"My Store" <no-reply@yourdomain.com>',
            subject: 'vrifcation',
            template: 'verify-email',
            context: {
                userName
            }
        }).catch(err => {
            console.error('Verification success mail failed:', err);
        });

        return { message: "Email verified successfully" };
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