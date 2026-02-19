/**
 * Semver validation and comparison utilities
 * Supports basic semantic versioning checks
 */

/**
 * Validate if a string is a valid semver version
 * Accepts: 1.0.0, 1.0.0-alpha, 1.0.0-beta.1, etc.
 */
export function isValidSemver(version: string): boolean {
  const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
  return semverRegex.test(version);
}

/**
 * Parse semver string to components
 */
function parseSemver(version: string): {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
} {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(-([a-zA-Z0-9.-]+))?/);

  if (!match) {
    throw new Error(`Invalid semver: ${version}`);
  }

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[5]
  };
}

/**
 * Compare two semver versions
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
function compareSemver(a: string, b: string): number {
  const vA = parseSemver(a);
  const vB = parseSemver(b);

  // Compare major
  if (vA.major !== vB.major) {
    return vA.major > vB.major ? 1 : -1;
  }

  // Compare minor
  if (vA.minor !== vB.minor) {
    return vA.minor > vB.minor ? 1 : -1;
  }

  // Compare patch
  if (vA.patch !== vB.patch) {
    return vA.patch > vB.patch ? 1 : -1;
  }

  // Compare prerelease (stable > prerelease)
  if (vA.prerelease && !vB.prerelease) {
    return -1;
  }
  if (!vA.prerelease && vB.prerelease) {
    return 1;
  }
  if (vA.prerelease && vB.prerelease) {
    return vA.prerelease.localeCompare(vB.prerelease);
  }

  return 0;
}

/**
 * Check if version satisfies a constraint
 * Supports: ^1.0.0 (caret), ~1.0.0 (tilde), >=1.0.0, >1.0.0, <=1.0.0, <1.0.0, 1.0.0 (exact)
 */
export function satisfiesVersion(version: string, constraint: string): boolean {
  // Empty constraint always satisfies
  if (!constraint) {
    return true;
  }

  // Exact match
  if (!constraint.match(/^[~^<>=]/)) {
    return version === constraint;
  }

  // Caret (^): Compatible with provided version (same major)
  if (constraint.startsWith('^')) {
    const targetVersion = constraint.slice(1);
    const target = parseSemver(targetVersion);
    const current = parseSemver(version);

    return (
      current.major === target.major &&
      (current.minor > target.minor ||
        (current.minor === target.minor && current.patch >= target.patch))
    );
  }

  // Tilde (~): Approximately equivalent (same major.minor)
  if (constraint.startsWith('~')) {
    const targetVersion = constraint.slice(1);
    const target = parseSemver(targetVersion);
    const current = parseSemver(version);

    return (
      current.major === target.major &&
      current.minor === target.minor &&
      current.patch >= target.patch
    );
  }

  // Greater than or equal (>=)
  if (constraint.startsWith('>=')) {
    const targetVersion = constraint.slice(2);
    return compareSemver(version, targetVersion) >= 0;
  }

  // Greater than (>)
  if (constraint.startsWith('>')) {
    const targetVersion = constraint.slice(1);
    return compareSemver(version, targetVersion) > 0;
  }

  // Less than or equal (<=)
  if (constraint.startsWith('<=')) {
    const targetVersion = constraint.slice(2);
    return compareSemver(version, targetVersion) <= 0;
  }

  // Less than (<)
  if (constraint.startsWith('<')) {
    const targetVersion = constraint.slice(1);
    return compareSemver(version, targetVersion) < 0;
  }

  return false;
}
