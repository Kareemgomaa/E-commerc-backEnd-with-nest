/// <reference types="multer" />
import { BadRequestException, Controller, Get, Param, Post, Req, Res, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import type { Response } from "express";
import { Request } from 'express';

@Controller("api/upload")
export class uploadController {
    @Post("image")
    @UseInterceptors(FileInterceptor('image',
        {
            storage: diskStorage({
                destination: './images',
                filename: (req, file, cb) => {
                    const prefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
                    const fileName = `${prefix}-${file.originalname}`
                    cb(null, fileName)
                }
            }),
            fileFilter: (req, file, cb) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                    return cb(new BadRequestException("only image files are allowed"), false)
                }
                cb(null, true)
            },
            limits: {
                fileSize: 1024 * 1024 * 2
            }
        }
    ))
    public uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) { throw new BadRequestException("no file uploaded") }
        console.log("file uploaded", { file });
        return { message: "file uploaded" }


    }

    @Post("multi-images")
    @UseInterceptors(FilesInterceptor('files', 10, {
        storage: diskStorage({
            destination: './images',
            filename: (req, file, cb) => {
                const prefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const fileName = `${prefix}-${file.originalname}`;
                cb(null, fileName);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new BadRequestException("only image files are allowed"), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 1024 * 1024 * 2
        }
    }))
    public uploadMultiFile(@UploadedFiles() files: Array<Express.Multer.File>) {
        if (!files) { throw new BadRequestException("no file uploaded") }
        console.log("files uploaded", { files });
        return { message: "files uploaded" }


    }

    @Get("image/:filename")
    public getImage(@Param("filename") filename: string, @Res() res: Response) {
        return res.sendFile(filename, { root: "./images" })

    }
}