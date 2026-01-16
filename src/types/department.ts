// Department types

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  parent?: DepartmentSummary;
  manager?: ManagerSummary;
  employeeCount: number;
}

export interface DepartmentTreeNode {
  id: number;
  name: string;
  code: string;
  description?: string;
  manager?: ManagerSummary;
  employeeCount: number;
  children: DepartmentTreeNode[];
}

export interface DepartmentSummary {
  id: number;
  name: string;
}

export interface ManagerSummary {
  id: number;
  name: string;
  avatar?: string;
}

export interface DefaultApprover {
  id: number;
  name: string;
  avatar?: string;
  departmentName?: string;
}

// Employee trong phòng ban
export interface DepartmentEmployee {
  id: number;
  employeeCode: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: string;
  jobTitle?: string;
}

// Request types
export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  parentId?: number;
  managerId?: number;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  parentId?: number;
  managerId?: number;
}
