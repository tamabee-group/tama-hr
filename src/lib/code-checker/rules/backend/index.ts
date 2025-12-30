/**
 * Backend Rules Index
 * Export tất cả backend rules
 */

// Architecture Rules
export {
  ServiceInterfacePatternRule,
  MapperComponentAnnotationRule,
  DomainBasedPackageRule,
} from "./architecture-rules";

// Exception Handling Rules
export {
  ErrorCodeEnumRule,
  CustomExceptionRule,
  ExceptionFactoryMethodRule,
} from "./exception-rules";

// Response Rules
export {
  ResponseEntityRule,
  BaseResponseMethodsRule,
  PageableParameterRule,
} from "./response-rules";

// Transaction Rules
export {
  TransactionalWriteRule,
  TransactionalReadRule,
} from "./transaction-rules";

// Repository Rules
export {
  DeletedCheckFirstRule,
  SpringDataJpaNamingRule,
} from "./repository-rules";

// Naming Rules
export {
  EntityNamingRule,
  MapperNamingRule,
  ConstantNamingRule,
} from "./naming-rules";

// Security Rules
export {
  PreAuthorizeRequiredRule,
  AdminPackageRolesRule,
  CompanyPackageRolesRule,
} from "./security-rules";

// Entity Rules
export {
  ExtendBaseEntityRule,
  NoRelationshipAnnotationsRule,
  LongTypeForForeignKeyRule,
} from "./entity-rules";

// Mapper Rules
export { MapperNullCheckRule, RequiredMapperMethodsRule } from "./mapper-rules";

// Comment Rules
export {
  VietnameseCommentsRule,
  NoRequirementCommentsRule,
  NoLabelAnnotationRule,
} from "./comment-rules";

// All backend rules
import {
  ServiceInterfacePatternRule,
  MapperComponentAnnotationRule,
  DomainBasedPackageRule,
} from "./architecture-rules";
import {
  ErrorCodeEnumRule,
  CustomExceptionRule,
  ExceptionFactoryMethodRule,
} from "./exception-rules";
import {
  ResponseEntityRule,
  BaseResponseMethodsRule,
  PageableParameterRule,
} from "./response-rules";
import {
  TransactionalWriteRule,
  TransactionalReadRule,
} from "./transaction-rules";
import {
  DeletedCheckFirstRule,
  SpringDataJpaNamingRule,
} from "./repository-rules";
import {
  EntityNamingRule,
  MapperNamingRule,
  ConstantNamingRule,
} from "./naming-rules";
import {
  PreAuthorizeRequiredRule,
  AdminPackageRolesRule,
  CompanyPackageRolesRule,
} from "./security-rules";
import {
  ExtendBaseEntityRule,
  NoRelationshipAnnotationsRule,
  LongTypeForForeignKeyRule,
} from "./entity-rules";
import { MapperNullCheckRule, RequiredMapperMethodsRule } from "./mapper-rules";
import {
  VietnameseCommentsRule,
  NoRequirementCommentsRule,
  NoLabelAnnotationRule,
} from "./comment-rules";

import type { IRule } from "../../interfaces/rule";

/**
 * Tất cả backend rules
 */
export const backendRules: IRule[] = [
  // Architecture Rules (BE-ARCH-001/002/003)
  new ServiceInterfacePatternRule(),
  new MapperComponentAnnotationRule(),
  new DomainBasedPackageRule(),

  // Exception Rules (BE-EXC-001/002/003)
  new ErrorCodeEnumRule(),
  new CustomExceptionRule(),
  new ExceptionFactoryMethodRule(),

  // Response Rules (BE-RESP-001/002/003)
  new ResponseEntityRule(),
  new BaseResponseMethodsRule(),
  new PageableParameterRule(),

  // Transaction Rules (BE-TXN-001/002)
  new TransactionalWriteRule(),
  new TransactionalReadRule(),

  // Repository Rules (BE-REPO-001/002)
  new DeletedCheckFirstRule(),
  new SpringDataJpaNamingRule(),

  // Naming Rules (BE-NAME-001/002/003)
  new EntityNamingRule(),
  new MapperNamingRule(),
  new ConstantNamingRule(),

  // Security Rules (BE-SEC-001/002/003)
  new PreAuthorizeRequiredRule(),
  new AdminPackageRolesRule(),
  new CompanyPackageRolesRule(),

  // Entity Rules (BE-ENT-001/002/003)
  new ExtendBaseEntityRule(),
  new NoRelationshipAnnotationsRule(),
  new LongTypeForForeignKeyRule(),

  // Mapper Rules (BE-MAP-001/002)
  new MapperNullCheckRule(),
  new RequiredMapperMethodsRule(),

  // Comment Rules (BE-CMT-001/002/003)
  new VietnameseCommentsRule(),
  new NoRequirementCommentsRule(),
  new NoLabelAnnotationRule(),
];
