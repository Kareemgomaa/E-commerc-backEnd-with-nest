import { Review } from "src/reviews/reviews.entity";
import { User } from "src/users/users.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    description!: string

    @Column()
    price!: number;


    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    createdAt?: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    updatedAt?: Date;

    @OneToMany(() => Review, (review) => review.product, { onDelete: 'CASCADE' })
    reviews?: Review[]

    @ManyToOne(() => User, (user) => user.products, { eager: true, onDelete: 'CASCADE' })
    user?: User
}
