import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class StartAccessHoldDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(240)
  reason!: string;

  @Type(() => Number)
  @IsIn([1, 24, 168])
  duration!: number;
}
