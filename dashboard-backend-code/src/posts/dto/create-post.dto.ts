import { IsString, IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  userId: number;

  @IsArray()
  categoryIds: number[];
}
