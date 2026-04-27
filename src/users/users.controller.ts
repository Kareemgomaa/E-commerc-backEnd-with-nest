/// <reference types="multer" />
import { updateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { RegisterDto } from "./dto/create-user.dto";
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { AuthRolesGuard } from './guards/auth-roles.guard';
import { Roles } from './decorator/users-role.decorator';
import { AuthServices } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from "express";
import { Request } from 'express';


@Controller("api/users")
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly authServices: AuthServices
    ) { }

    @Post("auth/register")
    public register(@Body() body: RegisterDto) {
        return this.authServices.register(body)
    }

    @Get("auth/login")
    public login(@Body() body: LoginDto) {
        return this.authServices.login(body)
    }


    @Get("current-user")
    @UseGuards(AuthGuard)
    public getCurrentUser(@Req() request: any) {
        console.log('enter rout ');

        return this.usersService.getCurrentUser(request.user.id)
    }

    @Get("all-users")
    @UseGuards(AuthRolesGuard)
    @Roles('admin', 'user')
    public getAllUsers() {
        return this.usersService.getAllUsers()
    }


    @Put('update')
    @UseGuards(AuthRolesGuard)
    @Roles('admin', 'user')
    public updateUser(@Req() request: any, @Body() updateUserDto: updateUserDto) {
        return this.usersService.updateUser(request.user.id, updateUserDto)
    }

    @Delete('delete')
    @UseGuards(AuthRolesGuard)
    public delete(@Req() request: any) {
        return this.usersService.delete(request.user.id)
    }

    @Post('/upload-profile-image')
    @UseGuards(AuthRolesGuard)
    @Roles('admin', 'user')
    @UseInterceptors(FileInterceptor('users-image', {
        storage: diskStorage({
            destination: './images/users',
            filename: (req, file, cb) => {
                const prefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const fileNam = `${prefix}-${file.originalname}`;
                cb(null, fileNam);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(null, false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 1024 * 1024 * 2
        }
    }))
    public uploadImage(@Req() request: any, @UploadedFile() file: Express.Multer.File) {
        if (!file) { throw new BadRequestException("No file to upload") }
        return this.usersService.uploadImage(request.user.id, file.filename);
    }
    @Delete('/remove-profile-image')
    @UseGuards(AuthRolesGuard)
    @Roles('admin', 'user')
    public removeImage(@Req() request: any) {
        return this.usersService.removeImage(request.user.id)
    }

    @Get('show-image/:filepath')
    @UseGuards(AuthRolesGuard)
    @Roles('admin', 'user')
    public async getProfileImage(@Req() request: any, @Param('filepath') filePath: string, @Res() res: Response) {
        return this.usersService.getProfileImage(request.user.id, filePath, res)
    }
}
