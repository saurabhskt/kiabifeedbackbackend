import {
  IsString, IsIn, IsNumber, IsArray,
  ValidateNested, IsOptional, IsDateString, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UserProfileDto {
  @IsString() name: string;
  @IsIn(['male','female','non_binary','prefer_not_to_say']) gender: string;
  @IsIn(['13-17','18-24','25-34','35-44','45-54','55+']) ageGroup: string;
  @IsIn(['working','non_working','student','retired']) employmentStatus: string;


  contact: string;
}

export class SurveyAnswerDto {
  @IsString() cardId: string;
  @IsString() section: string;
  @IsString() statement: string;
  @IsString() answer: string;
  @IsNumber() dwellTimeMs: number;

}

export class SubmitSurveyDto {
  @ValidateNested()
  @Type(() => UserProfileDto)
  userProfile: UserProfileDto;

  @IsString() sessionId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SurveyAnswerDto)
  answers: SurveyAnswerDto[];



  skippedCardIds: string[];

  @IsString() incomeBracket: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;


}
