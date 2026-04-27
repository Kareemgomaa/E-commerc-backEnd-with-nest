import { forwardRef, Module } from "@nestjs/common";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { UsersModule } from "src/users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "./reviews.entity";
import { ProductModule } from "src/products/products.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
    controllers: [ReviewsController],
    providers: [ReviewsService],
    exports: [ReviewsService],
    imports: [UsersModule, TypeOrmModule.forFeature([Review]), JwtModule, ProductModule],
})
export class ReviewsModule { }
