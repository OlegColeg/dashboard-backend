import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from '../entities/post.entity';
import { User } from '../users/user.entity';
import { Category } from '../entities/category.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const user = await this.usersRepository.findOne({ where: { id: createPostDto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const categories = await this.categoriesRepository.findBy({ id: In(createPostDto.categoryIds || []) });

    const post = this.postsRepository.create({
      title: createPostDto.title,
      content: createPostDto.content,
      user: user,
      categories: categories,
    });

    return this.postsRepository.save(post);
  }

  findAll() {
    return this.postsRepository.find({ relations: ['user', 'categories'] });
  }

  findOne(id: number) {
    return this.postsRepository.findOne({ where: { id }, relations: ['user', 'categories'] });
  }

  async update(id: number, updatePostDto: CreatePostDto) {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const user = await this.usersRepository.findOne({ where: { id: updatePostDto.userId } });
    const categories = await this.categoriesRepository.findBy({ id: In(updatePostDto.categoryIds || []) });

    post.title = updatePostDto.title;
    post.content = updatePostDto.content;
    post.user = user;
    post.categories = categories;

    return this.postsRepository.save(post);
  }

  async remove(id: number) {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.postsRepository.remove(post);
  }
}
