import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 64)
  // at least 8 chars; you can add complexity rules if desired
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-()\s]*$/)
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}

