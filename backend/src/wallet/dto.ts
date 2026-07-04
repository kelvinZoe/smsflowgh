import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ManualTopUpDto {
  @IsString()
  clientId!: string;

  @IsInt()
  @Min(1)
  units!: number;

  @IsOptional()
  @IsString()
  note?: string;
}
