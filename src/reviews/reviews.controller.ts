import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import { createNewRviewDto } from "./dto/create-review.dto";
import { ReviewsService } from './reviews.service';
import { AuthRolesGuard } from "src/users/guards/auth-roles.guard";
import { Roles } from "src/users/decorator/users-role.decorator";


@Controller("/reviews")
export class ReviewsController {

    constructor(
        private readonly reviewsService: ReviewsService,

    ) { }

    @Post("/:productId")
    @UseGuards(AuthRolesGuard)
    @Roles('admin', 'user')
    public createNewReview(
        @Req() request: any,
        @Param("productId", ParseIntPipe) productId: number,
        @Body() body: createNewRviewDto) {
        return this.reviewsService.createReview(body, request.user.id, productId)
    }

}
