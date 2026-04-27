import { Module } from "@nestjs/common";
import { uploadController } from "./uploads.controller";
import { MulterModule } from "@nestjs/platform-express";

@Module({
    controllers: [uploadController],
    imports: [MulterModule.register()]
})
export class uploadModule {

}