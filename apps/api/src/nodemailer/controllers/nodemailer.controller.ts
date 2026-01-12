import { Body, Controller, Post } from '@nestjs/common';
import { NodemailerService } from '../services/nodemailer.service';
import { SendEmailDto } from '../dto/send_email.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('nodemailer')
@Controller('nodemailer')
export class NodemailerController {
  constructor(private readonly nodemailerService: NodemailerService) {}

  @Post('/send-email')
  async emailSend(
    @Body()
    {
      from,
      recipients,
      subject,
      emailTemplate,
      userNameToEmail,
      userIdNumberToEmail,
      fenixUrl,
      supportContactEmail,
      verificationCode,
      resetPasswordUrl,
    }: SendEmailDto,
  ) {
    return await this.nodemailerService.sendEmail({
      from,
      recipients,
      subject,
      emailTemplate,
      userNameToEmail,
      userIdNumberToEmail,
      fenixUrl,
      supportContactEmail,
      verificationCode,
      resetPasswordUrl,
    });
  }
}
