import { Review } from 'src/reviews/reviews.entity';
import { Product } from './../products/product.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    username!: string;

    @Column()
    email!: string;

    @Column()
    @Exclude()
    password!: string;

    @Column({ type: 'enum', enum: ['admin', 'user'], default: 'user' })
    userType!: string

    @Column({ default: false })
    isAccountVerified!: boolean;

    @Column({ type: 'varchar', nullable: true })
    varificationToken!: string | null;


    @Column({ type: 'varchar', nullable: true, default: null })
    profileImage!: string | null;

    @Column()
    name!: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    createdAt?: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    updatedAt?: Date;


    @OneToMany(() => Product, (product) => product.user, { onDelete: 'CASCADE' })
    products?: Product[];

    @OneToMany(() => Review, (review) => review.user, { onDelete: 'CASCADE' })
    reviews?: Review[];


}