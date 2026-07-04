import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class MomoCallbackDto {
  @IsString()
  providerReference!: string;

  @IsIn(['SUCCESSFUL', 'FAILED', 'PENDING'])
  status!: 'SUCCESSFUL' | 'FAILED' | 'PENDING';

  @IsOptional()
  @IsObject()
  raw?: Record<string, unknown>;
}
