import { Injectable } from '@nestjs/common';
import { SendEmailDto } from '../dto/send_email.dto';
import { MailerService } from '@nestjs-modules/mailer';
import {
  DEFAULT_EMAIL_FROM,
  NAME_EMAIL_FROM,
} from '../constants/email_config.constant';
import { resolve } from 'path';

@Injectable()
export class NodemailerService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(email: SendEmailDto) {
    const {
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
    } = email;

    try {
      const response = await this.mailerService.sendMail({
        from: from ?? {
          name: NAME_EMAIL_FROM,
          address: DEFAULT_EMAIL_FROM,
        },
        to: recipients,
        subject: subject,
        template: emailTemplate,
        context: {
          userNameToEmail,
          userIdNumberToEmail,
          fenixUrl,
          supportContactEmail,
          verificationCode,
          resetPasswordUrl,
        },
        attachments: [
          {
            filename: 'fenix-ver-naranja-sin-fondo-ok.png',
            path: resolve(
              __dirname,
              '../../../assets/logos/fenix-ver-naranja-sin-fondo-ok.png',
            ),
            cid: 'logo_fenix@fenix.co',
          },
        ],
      });

      return response;
    } catch (error) {
      console.error('Error al enviar correo: ', error);
      throw error;
    }
  }
}
