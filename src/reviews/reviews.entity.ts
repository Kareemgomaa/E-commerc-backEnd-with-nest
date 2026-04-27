import { User } from 'src/users/users.entity';
import { Product } from './../products/product.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'reviews' })
export class Review {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    rating!: number;

    @Column()
    comment!: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    createdAt?: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    updatedAt?: Date;

    @ManyToOne(() => Product, (product) => product.reviews, { eager: true, onDelete: 'CASCADE' })
    product?: Product;

    @ManyToOne(() => User, (user) => user.reviews, { eager: true, onDelete: 'CASCADE' })
    user?: User;



}