import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { PayloadTypeEnum } from '../enums/payload-type.enum';
import { ChannelEnum } from '../enums/channel.enum';

export class DispatchInteropDto {
  @ApiProperty({
    description: 'Tipo de documento de identificación',
    example: 'CC',
    minLength: 1,
    maxLength: 10,
  })
  @IsNotEmpty({ message: 'El tipo de documento es requerido' })
  @IsString({ message: 'El tipo de documento debe ser un texto' })
  @MinLength(1, {
    message: 'El tipo de documento debe tener al menos 1 carácter',
  })
  @MaxLength(10, {
    message: 'El tipo de documento no puede exceder 10 caracteres',
  })
  tipoDocumento: string;

  @ApiProperty({
    description: 'Número de documento de identificación',
    example: '1234567890',
    minLength: 5,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'El número de documento es requerido' })
  @IsString({ message: 'El número de documento debe ser un texto' })
  @MinLength(5, {
    message: 'El número de documento debe tener al menos 5 caracteres',
  })
  @MaxLength(20, {
    message: 'El número de documento no puede exceder 20 caracteres',
  })
  numeroDocumento: string;

  @ApiProperty({
    description: 'Tipo de formato del payload a enviar',
    enum: PayloadTypeEnum,
    example: PayloadTypeEnum.FHIR,
  })
  @IsNotEmpty({ message: 'El tipo de payload es requerido' })
  @IsEnum(PayloadTypeEnum, {
    message: `El tipo de payload debe ser uno de: ${Object.values(PayloadTypeEnum).join(', ')}`,
  })
  payloadType: PayloadTypeEnum;

  @ApiProperty({
    description: 'Canal desde el cual se realiza la operación',
    enum: ChannelEnum,
    example: ChannelEnum.API,
  })
  @IsNotEmpty({ message: 'El canal es requerido' })
  @IsEnum(ChannelEnum, {
    message: `El canal debe ser uno de: ${Object.values(ChannelEnum).join(', ')}`,
  })
  channel: ChannelEnum;
}
