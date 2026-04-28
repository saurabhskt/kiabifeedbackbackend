// src/env.validation.ts
import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
    @IsString() DB_HOST: string;
    @IsNumber() DB_PORT: number;
    @IsString() DB_USERNAME: string;
    @IsString() DB_PASSWORD: string;
    @IsString() DB_NAME: string;
}

export function validate(config: Record<string, unknown>) {
    const validated = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = validateSync(validated);
    if (errors.length) throw new Error(errors.toString());
    return validated;
}
