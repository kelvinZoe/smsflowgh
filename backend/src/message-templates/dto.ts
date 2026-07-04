import { IsString, MinLength } from 'class-validator';

export class CreateMessageTemplateDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(1)
  body!: string;
}
