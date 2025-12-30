/**
 * Component Placement Rules (FE-PLACE-001)
 * Check components are placed at correct location in folder hierarchy
 */

import * as path from "path";
import { BaseRule } from "../../interfaces/rule";
import type { ParsedFile, RuleContext, Violation } from "../../types";

/**
 * FE-PLACE-001: Component placement check
 * Build import graph and verify component is placed at correct folder level
 */
export class ComponentPlacementRule extends BaseRule {
  id = "FE-PLACE-001";
  name = "Component placement check";
  category = "component-placement" as const;
  severity = "warning" as const;
  description =
    "Component must be placed at correct folder level based on usage count";
  projectType = "frontend" as const;
  canAutoFix = false;

  check(file: ParsedFile, context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check component files
    if (!file.file.isComponent) {
      return violations;
    }

    const normalizedPath = file.file.relativePath.replace(/\\/g, "/");

    // Skip files in ui/ folder (shadcn)
    if (normalizedPath.includes("/ui/")) {
      return violations;
    }

    // Get list of files that import this component
    const importedBy = context.importGraph.importedBy.get(normalizedPath) || [];

    // Skip if no one imports it
    if (importedBy.length === 0) {
      return violations;
    }

    // Analyze locations of importing files
    const importerDirs = importedBy.map((imp) =>
      path.dirname(imp).replace(/\\/g, "/"),
    );

    // Find common parent directory
    const componentDir = path.dirname(normalizedPath);

    // Check if component is in _shared or _components folder
    const isInSharedFolder =
      normalizedPath.includes("/_shared/") ||
      normalizedPath.includes("/_components/");

    if (importedBy.length === 1) {
      // Component is only used in 1 place
      const importerDir = importerDirs[0];

      // If component is in higher folder than importer, suggest moving down
      if (isInSharedFolder && !importerDir.startsWith(componentDir)) {
        // Find appropriate folder to move to
        const suggestedDir = this.findSuggestedDir(importerDir);

        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: 1,
            column: 1,
            message: `Component is only used in 1 place but placed in shared folder`,
            suggestion: `Move component to ${suggestedDir}/_components/ or same folder as the file using it`,
            codeSnippet: normalizedPath,
          }),
        );
      }
    } else if (importedBy.length >= 2) {
      // Component is used in multiple places
      // Check if placed at correct common parent
      const commonParent = this.findCommonParent(importerDirs);

      // If component is not in common parent or higher
      if (
        !componentDir.startsWith(commonParent) &&
        componentDir !== commonParent
      ) {
        // Check if component is in child folder of an importer
        const isInChildFolder = importerDirs.some((dir) =>
          componentDir.startsWith(dir),
        );

        if (isInChildFolder) {
          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: 1,
              column: 1,
              message: `Component is used in ${importedBy.length} places but placed in child folder`,
              suggestion: `Move component up to ${commonParent}/_components/`,
              codeSnippet: normalizedPath,
            }),
          );
        }
      }
    }

    return violations;
  }

  /**
   * Find suggested directory to place component
   */
  private findSuggestedDir(importerDir: string): string {
    // Find nearest folder that can hold component
    const parts = importerDir.split("/");

    // Find layout folder (e.g., (tamabee-admin), (company-admin))
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i].startsWith("(") && parts[i].endsWith(")")) {
        return parts.slice(0, i + 1).join("/");
      }
    }

    return importerDir;
  }

  /**
   * Find common parent directory of multiple paths
   */
  private findCommonParent(dirs: string[]): string {
    if (dirs.length === 0) return "";
    if (dirs.length === 1) return dirs[0];

    const splitDirs = dirs.map((d) => d.split("/"));
    const minLength = Math.min(...splitDirs.map((d) => d.length));

    const commonParts: string[] = [];
    for (let i = 0; i < minLength; i++) {
      const part = splitDirs[0][i];
      if (splitDirs.every((d) => d[i] === part)) {
        commonParts.push(part);
      } else {
        break;
      }
    }

    return commonParts.join("/");
  }
}
