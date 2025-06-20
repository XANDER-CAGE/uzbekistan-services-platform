import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';
import { UserType } from '../../users/entities/user.entity';

// Декоратор для указания ролей
export const Roles = (roles: UserType[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserType[]>('roles', context.getHandler());
    
    if (!requiredRoles) {
      return true; // Если роли не указаны, разрешаем доступ
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Проверяем, есть ли у пользователя нужная роль
    return requiredRoles.includes(user.userType) || user.userType === UserType.BOTH;
  }
}