import { Module } from '@nestjs/common';
// import { MailController } from './mail.controller';
// import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/adapters/ejs.adapter';


@Module({
  // controllers: [MailController],
  // providers: [MailService],
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          transport: {
            host: config.get<string>('SMTP_HOST'),
            port: config.get<number>('SMTP_PORT'),
            secure: false,
            auth: {
              user: config.get<string>('SMTP_USERNAME'),
              pass: config.get<string>('SMTP_PASSWORD')
            },
            tls: {
              rejectUnauthorized: false // أحياناً يكون ضرورياً إذا كان هناك مشكلة في شهادات الـ SSL
            },
          },
          template: {
            dir: join(__dirname, 'template'),
            adapter: new EjsAdapter({
              inlineCssEnabled: true
            }),
          },
        }
      }
    })
  ],
  exports: [MailerModule, /**MailService*/]
})
export class MailModule { }
