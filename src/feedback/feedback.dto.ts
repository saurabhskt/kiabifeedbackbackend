import { IsString, IsIn, IsNumber, IsOptional, ValidateNested, ArrayNotEmpty, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class UserProfileDto {
  @IsString() name: string;
  @IsIn(['male','female','non_binary','prefer_not_to_say']) gender: string;
  @IsIn(['13-17','18-24','25-34','35-44','45-54','55+']) ageGroup: string;
  @IsIn(['working','non_working','student','retired']) employmentStatus: string;
}

export class CreateFeedbackDto {
  @ValidateNested()
  @Type(() => UserProfileDto)
  userProfile: UserProfileDto;

  @IsNumber() outfitId: number;
  @IsIn(['love','nope']) vote: string;
  @IsOptional() @IsNumber() dwellTimeMs?: number;
}

export class BulkFeedbackDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateFeedbackDto)
  feedbacks: CreateFeedbackDto[];
}
