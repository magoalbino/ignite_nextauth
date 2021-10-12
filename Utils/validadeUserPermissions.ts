type User = {
  permissions: string[];
  roles: string[];
}

type ValidadeUserPermissionsParams = {
  user: User;
  permissions?: string[];
  roles: string[];
}

export function validadeUserPermissions({user, permissions, roles}: ValidadeUserPermissionsParams) {
  if (permissions?.length > 0) {
    // o 'every' vai retornar true somente quando todas as condições forem satisfeitas
    const hasAllPermissions = permissions.every(permission => {
      return user.permissions.includes(permission);
    })

    if (!hasAllPermissions) {
      return false;
    }
  }

  if (roles?.length > 0) {
    // o 'some' vai retornar true se qualquer uma das condições forem true (qualquer perfil que eu passar na página pra essa função)
    const hasAllRoles = roles.some(role => {
      return user.roles.includes(role);
    })

    if (!hasAllRoles) {
      return false;
    }
  }

  return true;
}