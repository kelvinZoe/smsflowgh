import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateContactDto {
  @IsPhoneNumber('GH')
  phone!: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}
