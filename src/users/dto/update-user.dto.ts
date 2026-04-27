import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class updateUserDto {

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    username!: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    password!: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name!: string;
}