import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class createNewRviewDto {
    @IsNumber()
    @IsNotEmpty()
    rating!: number

    @IsString()
    @IsOptional()
    comment!: string
}