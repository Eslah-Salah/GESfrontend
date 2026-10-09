import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PropertyType } from '../property.types';

const Trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CreatePropertyDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  businessAr!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  businessEn!: string;

  @IsIn(['Hotel', 'Travel agency'])
  type!: PropertyType;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  cr!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  tax!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  phone!: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  fax?: string;

  @Trim()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  city!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(240)
  address!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  languages!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  openingDays!: string;
}
