/**
 * Statistics Card Rules (FE-CARD-001, FE-CARD-002)
 * Check statistics cards compliance with design guidelines
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedFile, RuleContext, Violation } from "../../types";

/**
 * FE-CARD-001: No icons in statistics cards
 * Detect icon usage in statistics cards and flag as Warning
 */
export class StatisticsCardIconRule extends BaseRule {
  id = "FE-CARD-001";
  name = "No icons in statistics cards";
  category = "statistics-cards" as const;
  severity = "warning" as const;
  description =
    "Do not use icons in statistics cards to keep the interface clean";
  projectType = "frontend" as const;
  canAutoFix = false;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Check if file has statistics card
    const statsCardPatterns = [
      /statistics/i,
      /stats-card/i,
      /stat-card/i,
      /dashboard.*card/i,
      /summary.*card/i,
    ];

    let isStatsCardFile = false;
    for (const pattern of statsCardPatterns) {
      if (pattern.test(file.file.relativePath) || pattern.test(file.content)) {
        isStatsCardFile = true;
        break;
      }
    }

    if (!isStatsCardFile) {
      return violations;
    }

    // Find icon usage in Card components
    const iconPatterns = [
      /<[A-Z][a-zA-Z]*Icon/g, // <SomeIcon
      /Icon\s*\/>/g, // Icon />
      /lucide-react/g, // lucide-react icons
      /@heroicons/g, // heroicons
      /react-icons/g, // react-icons
      /Icon\s*className/g, // Icon className
    ];

    // Find Card context
    let inCardContext = false;
    let cardStartLine = -1;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];

      // Detect Card start
      if (line.includes("<Card") && !line.includes("</Card>")) {
        inCardContext = true;
        cardStartLine = i + 1;
      }

      // Detect Card end
      if (line.includes("</Card>")) {
        inCardContext = false;
      }

      // Check icon in Card context
      if (inCardContext) {
        for (const pattern of iconPatterns) {
          let match;
          while ((match = pattern.exec(line)) !== null) {
            violations.push(
              this.createViolation({
                file: file.file.relativePath,
                line: i + 1,
                column: match.index + 1,
                message: `Icon used in statistics card: ${match[0]}`,
                suggestion:
                  'Remove icon to keep interface clean, avoid "AI-generated" look',
                codeSnippet: line.trim(),
              }),
            );
          }
          pattern.lastIndex = 0;
        }
      }
    }

    return violations;
  }
}

/**
 * FE-CARD-002: Proper color classes in statistics cards
 * Verify proper color classes are used (text-green-600, text-yellow-600, etc.)
 */
export class StatisticsCardColorRule extends BaseRule {
  id = "FE-CARD-002";
  name = "Proper color classes";
  category = "statistics-cards" as const;
  severity = "info" as const;
  description =
    "Statistics cards must use proper color classes (text-green-600, text-yellow-600, text-blue-600, text-red-600)";
  projectType = "frontend" as const;
  canAutoFix = false;

  // Allowed color classes for statistics values
  private readonly allowedColors = [
    "text-green-600",
    "text-yellow-600",
    "text-blue-600",
    "text-red-600",
    "text-green-500",
    "text-yellow-500",
    "text-blue-500",
    "text-red-500",
  ];

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Check if file has statistics card
    const statsCardPatterns = [
      /statistics/i,
      /stats-card/i,
      /stat-card/i,
      /dashboard.*card/i,
      /summary.*card/i,
    ];

    let isStatsCardFile = false;
    for (const pattern of statsCardPatterns) {
      if (pattern.test(file.file.relativePath) || pattern.test(file.content)) {
        isStatsCardFile = true;
        break;
      }
    }

    if (!isStatsCardFile) {
      return violations;
    }

    // Find Card context and check structure
    let inCardContext = false;
    let hasLabelClass = false;
    let hasValueClass = false;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];

      // Detect Card start
      if (line.includes("<Card")) {
        inCardContext = true;
        hasLabelClass = false;
        hasValueClass = false;
      }

      // Detect Card end
      if (line.includes("</Card>")) {
        // Check structure when Card ends
        if (inCardContext && !hasLabelClass && !hasValueClass) {
          // No proper structure, but only flag if has CardContent
          if (file.content.includes("CardContent")) {
            // Skip as it might be a different type of card
          }
        }
        inCardContext = false;
      }

      if (inCardContext) {
        // Check label class
        if (
          line.includes("text-sm") &&
          line.includes("text-muted-foreground")
        ) {
          hasLabelClass = true;
        }

        // Check value class
        if (line.includes("text-2xl") && line.includes("font-bold")) {
          hasValueClass = true;

          // Check if has color class
          const hasAllowedColor = this.allowedColors.some((color) =>
            line.includes(color),
          );

          if (!hasAllowedColor) {
            // Check if has any other color class
            const colorPattern = /text-[a-z]+-\d+/g;
            const colorMatch = line.match(colorPattern);

            if (colorMatch) {
              const invalidColors = colorMatch.filter(
                (c) => !this.allowedColors.includes(c),
              );
              if (invalidColors.length > 0) {
                violations.push(
                  this.createViolation({
                    file: file.file.relativePath,
                    line: i + 1,
                    column: 1,
                    message: `Statistics card value uses non-standard color: ${invalidColors.join(", ")}`,
                    suggestion: `Use one of these colors: ${this.allowedColors.join(", ")}`,
                    codeSnippet: line.trim(),
                  }),
                );
              }
            }
          }
        }
      }
    }

    return violations;
  }
}
