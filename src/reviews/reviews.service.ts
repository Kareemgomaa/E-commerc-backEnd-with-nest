import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Review } from "./reviews.entity";
import { Repository } from "typeorm";
import { UsersService } from "src/users/users.service";
import { ProductsService } from "src/products/products.service";
import { createNewRviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewsService {

    constructor(
        @InjectRepository(Review)
        private readonly reviewsRepository: Repository<Review>,
        private readonly usersService: UsersService,
        private readonly productsService: ProductsService
    ) { }

    public async createReview(
        dto: createNewRviewDto,
        userId: number,
        productId: number
    ) {
        const user = await this.usersService.getCurrentUser(userId)
        const product = await this.productsService.getSingleProduct(productId)
        const newReview = await this.reviewsRepository.create({
            ...dto,
            user,
            product
        })
        await this.reviewsRepository.save(newReview)
        return { message: "review created", newReview }
    }
}
