/**
 * Navigation Rules (FE-NAV-001, FE-NAV-002)
 * Check navigation code compliance with rules
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedFile, RuleContext, Violation } from "../../types";

/**
 * FE-NAV-001: Do not use window.location.href
 * Detect usage of window.location.href and flag as Error
 */
export class NavigationHrefRule extends BaseRule {
  id = "FE-NAV-001";
  name = "No window.location.href";
  category = "navigation" as const;
  severity = "error" as const;
  description = "Do not use window.location.href for page navigation";
  projectType = "frontend" as const;
  canAutoFix = true;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const pattern = /window\.location\.href\s*=/;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];
      const match = line.match(pattern);

      if (match) {
        // Extract URL from assignment
        const urlMatch = line.match(
          /window\.location\.href\s*=\s*['"`]([^'"`]+)['"`]/,
        );
        const url = urlMatch ? urlMatch[1] : "";

        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: i + 1,
            column: match.index ? match.index + 1 : 1,
            message: "Using window.location.href for page navigation",
            suggestion: `Use router.push('${url}') from next/navigation or <Link href="${url}"> from next/link`,
            codeSnippet: line.trim(),
            fixCode: url ? `router.push('${url}')` : undefined,
          }),
        );
      }
    }

    return violations;
  }

  fix(
    file: ParsedFile,
    violation: Violation,
  ): { success: boolean; file: string; violation: Violation; error?: string } {
    if (!violation.fixCode) {
      return {
        success: false,
        file: file.file.relativePath,
        violation,
        error: "No fix code available",
      };
    }

    const lineIndex = violation.line - 1;
    const oldLine = file.lines[lineIndex];
    const newLine = oldLine.replace(
      /window\.location\.href\s*=\s*['"`][^'"`]*['"`]/,
      violation.fixCode,
    );

    file.lines[lineIndex] = newLine;
    file.content = file.lines.join("\n");

    return { success: true, file: file.file.relativePath, violation };
  }
}

/**
 * FE-NAV-002: Do not use <a href> for internal links
 * Detect usage of <a href> for internal links and flag as Warning
 */
export class NavigationAnchorRule extends BaseRule {
  id = "FE-NAV-002";
  name = "No anchor tags for internal links";
  category = "navigation" as const;
  severity = "warning" as const;
  description =
    "Do not use <a href> for internal links, use <Link> from next/link";
  projectType = "frontend" as const;
  canAutoFix = true;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    // Pattern to detect <a href="..." with internal links (starting with / or no protocol)
    const pattern = /<a\s+[^>]*href\s*=\s*['"]([^'"]+)['"]/gi;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];
      let match;

      while ((match = pattern.exec(line)) !== null) {
        const href = match[1];

        // Check if it's an internal link (starts with / or has no protocol)
        const isInternalLink =
          href.startsWith("/") ||
          (!href.startsWith("http://") &&
            !href.startsWith("https://") &&
            !href.startsWith("mailto:") &&
            !href.startsWith("tel:") &&
            !href.startsWith("#"));

        if (isInternalLink) {
          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: i + 1,
              column: match.index + 1,
              message: `Using <a href="${href}"> for internal link`,
              suggestion: `Use <Link href="${href}"> from next/link`,
              codeSnippet: match[0],
              fixCode: `<Link href="${href}"`,
            }),
          );
        }
      }

      // Reset regex lastIndex
      pattern.lastIndex = 0;
    }

    return violations;
  }

  fix(
    file: ParsedFile,
    violation: Violation,
  ): { success: boolean; file: string; violation: Violation; error?: string } {
    if (!violation.fixCode) {
      return {
        success: false,
        file: file.file.relativePath,
        violation,
        error: "No fix code available",
      };
    }

    const lineIndex = violation.line - 1;
    const oldLine = file.lines[lineIndex];
    // Replace <a href="..." with <Link href="..."
    const newLine = oldLine.replace(/<a\s+([^>]*)href\s*=/, "<Link $1href=");

    file.lines[lineIndex] = newLine;
    file.content = file.lines.join("\n");

    return { success: true, file: file.file.relativePath, violation };
  }
}
