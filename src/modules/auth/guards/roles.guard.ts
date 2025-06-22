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

    console.log('RolesGuard check:', {
      requiredRoles,
      requiredAdminRoles,
      userType: user?.userType,
      userRole: user?.role,
      userId: user?.id
    });

    if (!user) {
      console.log('RolesGuard: No user found');
      return false;
    }

    // Если указаны админские роли, проверяем их
    if (requiredAdminRoles && requiredAdminRoles.length > 0) {
      if (!user.role) {
        console.log('RolesGuard: User has no role');
        return false;
      }
      const hasAdminRole = requiredAdminRoles.includes(user.role);
      console.log('RolesGuard: Admin role check result:', hasAdminRole);
      return hasAdminRole;
    }

    // Если указаны обычные роли, проверяем их
    if (requiredRoles && requiredRoles.length > 0) {
      // ИСПРАВЛЕНИЕ: Пользователь с типом BOTH может делать все
      const hasAccess = requiredRoles.includes(user.userType) || user.userType === UserType.BOTH;
      console.log('RolesGuard: User type check result:', hasAccess);
      return hasAccess;
    }

    // Если роли не указаны, разрешаем доступ
    console.log('RolesGuard: No roles required, allowing access');
    return true;
  }
}