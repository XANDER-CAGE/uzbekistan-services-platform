import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Простой guard для защиты routes с помощью JWT
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}