import { Module } from "@nestjs/common";
import { uploadController } from "./uploads.controller";
import { MulterModule } from "@nestjs/platform-express";
import { CloudinaryProvider } from "./cloudinary.config";

@Module({
    controllers: [uploadController],
    imports: [MulterModule.register()],
    providers: [CloudinaryProvider]
})
export class uploadModule {

}