import { IsMobilePhone, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  smsPackageId!: string;

  @IsMobilePhone('en-GH')
  momoNumber!: string;
}
