import { BadRequestException, Injectable, NotFoundException, RequestTimeoutException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { RegisterDto } from "./dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class AuthServices {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly jwtservices: JwtService,
        private readonly configService: ConfigService,
        private readonly mailService: MailerService
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
            name
        })
        newUser = await this.usersRepository.save(newUser)

        const payload = { id: newUser.id, userType: newUser.userType };
        const token = await this.jwtservices.signAsync(payload);
        try {
            await this.mailService.sendMail({
                to: newUser.email,
                from: '"My Store" <no-reply@yourdomain.com>',
                subject: 'Register',
                html: `<div><h2>Hi ${newUser.name}</h2></div>`
            })
        } catch (error) {
            console.log(error);
            throw new RequestTimeoutException();
        }
        return { message: "user created successfully", accessToken: token, user: newUser }
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