import { IsString, Matches, MinLength } from 'class-validator';

export class CreateSenderIdDto {
  @IsString()
  @MinLength(2)
  @Matches(/^[A-Za-z0-9 ]{2,11}$/)
  name!: string;
}
