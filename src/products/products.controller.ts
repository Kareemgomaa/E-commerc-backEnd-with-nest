import { ProductsService } from './products.service';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-products.dto";
import { ConfigService } from '@nestjs/config';
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard';
import { Roles } from 'src/users/decorator/users-role.decorator';

@Controller("/products")
export class ProductController {

    constructor(
        private readonly productsService: ProductsService,
        private readonly config: ConfigService,
    ) { }


    @Get()
    public getAllProducts(
        @Query("pageNumber", ParseIntPipe) pageNumber: number,
        @Query("productPerPage", ParseIntPipe) productPerPage: number
    ) {
        return this.productsService.getAllProducts(pageNumber, productPerPage)
    }

    @Get('filter')
    public getFilteredProducts(@Query("title") title: string) {
        return this.productsService.getFilteredProducts(title)
    }

    @Post()
    @UseGuards(AuthRolesGuard)
    @Roles('admin')
    public createProduct(@Body() body: CreateProductDto, @Req() request: any) {
        return this.productsService.createProduct(body, request.user.id)
    }

    @Get(":id")
    public getSingleProduct(@Param("id", ParseIntPipe) id: number) {
        return this.productsService.getSingleProduct(id)
    }

    @Delete(":id")
    public async deleteProduct(@Param("id", ParseIntPipe) id: number) {
        return this.productsService.deleteProduct(id)
    }
    @Delete()
    public async deleteAllProducts() {
        return this.productsService.deleteAllProducts()
    }

    @Get("ids/:id")
    public getProductsByIds(@Param("id", ParseIntPipe) id: number) {
        return this.productsService.getProductsByIds(id)
    }
}