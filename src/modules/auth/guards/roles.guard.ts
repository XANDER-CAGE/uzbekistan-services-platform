// src/modules/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';
import { UserType, UserRole } from '../../users/entities/user.entity';

// Декоратор для указания ролей (принимает массив UserType)
export const Roles = (roles: UserType[]) => SetMetadata('roles', roles);

// Декоратор для указания ролей администратора (принимает массив UserRole)
export const AdminRoles = (roles: UserRole[]) => SetMetadata('adminRoles', roles);

// Дополнительный декоратор для удобства (алиас)
export const UserTypes = (userTypes: UserType[]) => SetMetadata('roles', userTypes);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Сначала проверяем обычные роли (UserType)
    const requiredRoles = this.reflector.get<UserType[]>('roles', context.getHandler());
    // Затем проверяем админские роли (UserRole)
    const requiredAdminRoles = this.reflector.get<UserRole[]>('adminRoles', context.getHandler());
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Если указаны админские роли, проверяем их
    if (requiredAdminRoles && requiredAdminRoles.length > 0) {
      if (!user.role) {
        return false;
      }
      return requiredAdminRoles.includes(user.role);
    }

    // Если указаны обычные роли, проверяем их
    if (requiredRoles && requiredRoles.length > 0) {
      return requiredRoles.includes(user.userType) || user.userType === UserType.BOTH;
    }

    // Если роли не указаны, разрешаем доступ
    return true;
  }
}

// Дополнительный guard специально для админки
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      return false;
    }

    // Разрешаем доступ для всех админских ролей
    const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR];
    return adminRoles.includes(user.role);
  }
}