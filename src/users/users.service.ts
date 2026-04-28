import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { RegisterDto } from "./dto/create-user.dto";
import { User } from "./users.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import { updateUserDto } from "./dto/update-user.dto";
import { join } from "node:path";
import { existsSync, unlinkSync } from "node:fs";

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }


    public async getAllUsers() {
        const users = await this.usersRepository.find({
            select: {
                username: true,
                email: true,
                name: true,
                isAccountVerified: true,
                userType: true,
                createdAt: true,
                updatedAt: true
            }
        })
        return { message: "user list", users }
    }


    public async getCurrentUser(userId: number) {

        const user = await this.usersRepository.findOne({
            where: { id: userId }
        })
        if (!user) { throw new NotFoundException("user not found") }
        return user
    }

    public async updateUser(id: number, updateUserDto: updateUserDto) {
        const { password, username, name } = updateUserDto;
        const user = await this.usersRepository.findOne({
            where: { id }
        })
        if (!user) {
            throw new NotFoundException("user not found")
        }
        user.username = username ?? user.username;
        user.name = name ?? user.name;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }
        return await this.usersRepository.save(user);

    }

    public async delete(id: number) {
        const user = await this.usersRepository.findOne({
            where: { id }
        })
        if (!user) {
            throw new NotFoundException("user not found")
        }
        await this.usersRepository.remove(user)
        return { message: "user deleted successfully" }
    }

    public async uploadImage(userId: number, newProfileImage: string) {
        const user = await this.usersRepository.findOne({
            where: { id: userId }
        })
        if (!user) {
            throw new NotFoundException("user not found")
        }
        if (user.profileImage) {
            this.removeImage(userId)
            user.profileImage = newProfileImage
            return await this.usersRepository.save(user)
        }
        user.profileImage = newProfileImage
        return await this.usersRepository.save(user)


    }

    public async removeImage(userId: number) {
        const user = await this.usersRepository.findOne({
            where: { id: userId }
        })
        if (!user) { throw new NotFoundException("user not found") }
        if (user.profileImage === null) { throw new BadRequestException("no image to remove") }

        // التحقق ما إذا كانت الصورة مخزنة محلياً قبل محاولة حذفها
        if (!user.profileImage.startsWith('http')) {
            const imagePath = join(process.cwd(), `./images/users/${user.profileImage}`);
            if (existsSync(imagePath)) {
                unlinkSync(imagePath);
            }
        }

        user.profileImage = null
        return await this.usersRepository.save(user)
    }

    public async getProfileImage(userId: number, filePath: string, res: any) {
        const user = await this.getCurrentUser(userId)
        if (!user) { throw new NotFoundException("user not found") }
        return res.sendFile(filePath, { root: './images/users' });

    }

}
