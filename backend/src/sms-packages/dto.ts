import { IsBoolean, IsInt, IsNumberString, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateSmsPackageDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsNumberString()
  amountGhs!: string;

  @IsInt()
  @Min(1)
  smsUnits!: number;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateSmsPackageDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsNumberString()
  amountGhs?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  smsUnits?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
