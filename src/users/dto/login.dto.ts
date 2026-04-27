import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class LoginDto {
    @IsEmail()
    @IsString()
    @MaxLength(50)
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}