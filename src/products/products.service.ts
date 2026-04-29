import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { CreateProductDto } from "./dto/create-products.dto"
import { In, Like, Repository } from "typeorm"
import { Product } from "./product.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { UsersService } from "src/users/users.service"

@Injectable()
export class ProductsService {

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly usersService: UsersService
    ) { }



    public async getAllProducts(pageNumber: number, productPerPage: number) {
        const skip = (pageNumber - 1) * productPerPage;
        const [products, totalCount] = await this.productRepository.findAndCount({
            skip: skip,
            take: productPerPage,
            relations: ['reviews'] // تم حذف user لأنه eager: true في الـ Entity
        });

        if (skip >= totalCount && totalCount > 0) {
            throw new BadRequestException("Requested page is out of range");
        }
        return {
            data: products,
            meta: {
                totalItems: totalCount,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalCount / productPerPage)
            }
        };
    }

    public async getFilteredProducts(title: string) {
        return await this.productRepository.find({ where: { title: Like(`%${title}%`) }, relations: ['reviews'] })
    }

    public async createProduct(dto: CreateProductDto, userId: number) {
        const user = await this.usersService.getCurrentUser(userId)
        const newProduct = await this.productRepository.create({
            ...dto,
            title: dto.title.toLowerCase(),
            user
        })
        await this.productRepository.save(newProduct)
        return { message: "product created", newProduct }
    }

    public async getSingleProduct(id: number) {
        const product = await this.productRepository.findOneBy({ id })
        if (!product) { throw new NotFoundException("not found") }
        return product
    }

    public async deleteProduct(id: number) {
        const product = await this.productRepository.findOne({ where: { id } })
        if (!product) { throw new NotFoundException("not found") }
        await this.productRepository.remove(product)
        return { message: "product deleted" }
    }
    public async deleteAllProducts() {
        const products = await this.productRepository.find()
        if (!products) { throw new NotFoundException("products not found") }
        await this.productRepository.delete(products)
        return { message: "all products deleted" }
    }

    public async getProductsByIds(id: number) {
        const products = await this.productRepository.find({ where: { id } })
        if (!products) { throw new NotFoundException("products not found") }
        return products
    }


}
