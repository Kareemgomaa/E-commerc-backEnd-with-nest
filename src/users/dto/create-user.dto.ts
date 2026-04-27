import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class RegisterDto {

    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;
}