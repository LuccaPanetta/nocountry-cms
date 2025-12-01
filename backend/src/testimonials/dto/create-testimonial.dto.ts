import { IsString, IsOptional, IsUUID, IsArray, IsNotEmpty } from 'class-validator';

export class CreateTestimonialDto {
  
  @IsString()
  @IsNotEmpty()
  contenido: string; 

  @IsString()
  @IsOptional()
  autorNombre?: string;

  @IsUUID() 
  @IsNotEmpty()
  categoryId: string; 
  
  @IsArray() 
  @IsUUID('4', { each: true }) 
  @IsOptional()
  tagIds?: string[];
}
