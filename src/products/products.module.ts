import { Module } from "@nestjs/common";
import { ProductController } from "./products.controller";
import { ProductsService } from "./products.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./product.entity";
import { UsersModule } from "src/users/users.module";


@Module({
    controllers: [ProductController],
    providers: [ProductsService],
    imports: [TypeOrmModule.forFeature([Product]), UsersModule],
    exports: [ProductsService]
})
export class ProductModule { }
