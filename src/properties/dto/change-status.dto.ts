import { IsIn } from 'class-validator';
import { PropertyAction } from '../property.types';

export class ChangeStatusDto {
  @IsIn(['Approve', 'Reject', 'Suspend', 'Turn back on'])
  action!: PropertyAction;
}
