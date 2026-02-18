export interface ExtractedRole {
  name: string
  code: number
}

export function extractUserRoles<
  T extends {
    data: {
      department_roles?: Array<{ role: { name: string; role_code: number } }>
    }
  },
>(response: T): ExtractedRole[] {
  if (!response?.data.department_roles) {
    return []
  }

  return response.data.department_roles.map((departmentRole) => ({
    name: departmentRole.role.name,
    code: departmentRole.role.role_code,
  }))
}

export function extractPrimaryRole<
  T extends {
    data: {
      department_roles?: Array<{ role: { name: string; role_code: number } }>
    }
  },
>(response: T): ExtractedRole | null {
  const roles = extractUserRoles(response)
  return roles.length > 0 ? roles[0]! : null
}
