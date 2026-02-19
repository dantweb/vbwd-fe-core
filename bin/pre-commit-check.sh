#!/bin/bash

# Pre-commit check script for vbwd-fe-core
# Usage:
#   ./bin/pre-commit-check.sh              # Run only style checks (eslint, type-check)
#   ./bin/pre-commit-check.sh --style      # Style checks (eslint, type-check)
#   ./bin/pre-commit-check.sh --unit       # Style checks + unit tests
#   ./bin/pre-commit-check.sh --all        # Run everything

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

# Default values
RUN_STYLE=true
RUN_UNIT=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --style)
            RUN_STYLE=true
            RUN_UNIT=false
            shift
            ;;
        --unit)
            RUN_STYLE=true
            RUN_UNIT=true
            shift
            ;;
        --all)
            RUN_STYLE=true
            RUN_UNIT=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --style   Run style checks (eslint, type-check) [default]"
            echo "  --unit    Run style checks + unit tests"
            echo "  --all     Run everything"
            echo "  --help    Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0              # Style checks only"
            echo "  $0 --unit       # Style checks + unit tests"
            echo "  $0 --all        # Everything"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Track overall success
OVERALL_EXIT=0

# Function to print section header
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to run style checks
run_style() {
    print_header "Style Checks"

    cd "$REPO_DIR"

    # ESLint
    echo "Running ESLint..."
    if npm run lint; then
        print_success "ESLint passed"
    else
        print_error "ESLint failed"
        OVERALL_EXIT=1
    fi

    # TypeScript check
    echo ""
    echo "Running TypeScript check..."
    if npm run type-check; then
        print_success "TypeScript check passed"
    else
        print_error "TypeScript check failed"
        OVERALL_EXIT=1
    fi
}

# Function to run unit tests
run_unit() {
    print_header "Unit Tests"

    cd "$REPO_DIR"

    echo "Running unit tests..."
    if npm run test:unit 2>&1 | tail -20; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        OVERALL_EXIT=1
    fi
}

# Main execution
echo -e "${BLUE}Pre-commit Check Script (vbwd-fe-core)${NC}"
echo "========================================"
echo ""
echo "Configuration:"
echo "  Style: $RUN_STYLE"
echo "  Unit:  $RUN_UNIT"

# Run style checks
if [[ "$RUN_STYLE" == "true" ]]; then
    run_style
fi

# Run unit tests
if [[ "$RUN_UNIT" == "true" ]]; then
    run_unit
fi

# Summary
echo ""
print_header "Summary"

if [[ "$OVERALL_EXIT" == "0" ]]; then
    print_success "All checks passed!"
else
    print_error "Some checks failed!"
fi

exit $OVERALL_EXIT
