import { IsNotEmpty, IsNumber, IsString, MaxLength, Min, MinLength } from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(20)
    title!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(150)
    description!: string;



    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    price!: number;
}
