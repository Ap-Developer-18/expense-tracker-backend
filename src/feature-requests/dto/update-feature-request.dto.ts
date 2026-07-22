import { PartialType } from '@nestjs/swagger';
import { CreateFeatureRequestDto } from './create-feature-request.dto';

export class UpdateFeatureRequestDto extends PartialType(CreateFeatureRequestDto) {}
