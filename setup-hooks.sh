#!/bin/bash

echo "Checking Husky configuration..."

if [ ! -d ".husky" ]; then
    echo "⚠️  Husky is missing or not initialized."
    echo "🔄 Initializing Husky..."

    if ! command -v npm &> /dev/null; then
        echo "❌ Error: npm is not installed."
        exit 1
    fi

    npm install --save-dev husky
    npx husky init

    echo "✅ Husky initialized successfully."
else
    echo "✅ Husky is already initialized."
fi

# ==========================================
# 1. SETUP POST-COMMIT HOOK (Version Bump)
# ==========================================
HOOK_FILE=".husky/post-commit"
HOOK_CONTENT='#!/bin/sh

# --- 1. ENVIRONMENT SETUP ---
export PATH="$PATH:/c/Program Files/Git/usr/bin:/c/Program Files/nodejs:/c/xampp/php:/c/tools/php"

# --- 2. GUI DETECTION ---
if [ -z "$TERM" ] || [ "$TERM" = "dumb" ]; then
    echo "🖥️  GUI detected. Skipping version bump."
    exit 0
fi

# --- 3. PREVENT RUNNING DURING GIT OPERATIONS ---
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ] || [ -d ".git/sequencer" ]; then
    echo "⚡ Git operation in progress. Skipping version bump."
    exit 0
fi

if [ -f ".git/MERGE_HEAD" ] || [ -f ".git/CHERRY_PICK_HEAD" ] || [ -f ".git/REVERT_HEAD" ] || [ -f ".git/BISECT_LOG" ]; then
    echo "⚡ Git operation in progress. Skipping version bump."
    exit 0
fi

# --- 4. LOOP PREVENTION ---
last_message=$(git log -1 --pretty=%B)
case "$last_message" in
  *"[skip ci]"*|*"Bump version"*)
    echo "⏭️  Skipping version bump (detected bump commit)."
    exit 0
    ;;
esac

echo "🚀 Commit successful. Incrementing version..."

# --- 5. EXECUTE BUMP SCRIPT ---
if [ -f "scripts/bump-version.php" ]; then
    php scripts/bump-version.php
    if [ $? -ne 0 ]; then
        echo "⚠️  Version bump script failed."
        exit 0
    fi
else
    echo "⚠️  scripts/bump-version.php not found."
    exit 0
fi

# --- 6. CHECK IF FILES WERE MODIFIED ---
if git diff --quiet package.json && git diff --quiet composer.json 2>/dev/null; then
    echo "ℹ️  No version changes detected. Skipping commit."
    exit 0
fi

# --- 7. STAGE & COMMIT ---
echo "📝 Staging version files..."
git add package.json
[ -f "composer.json" ] && git add composer.json

echo "💾 Committing version bump..."
git commit -m "Bump version [skip ci]" --no-verify

if [ $? -ne 0 ]; then
    echo "⚠️  Failed to commit version bump."
    exit 0
fi

# --- 8. CREATE TAG ---
VERSION=$(php -r "echo json_decode(file_get_contents('\''package.json'\''), true)['\''version'\''] ?? '\'''\'';")
if [ -n "$VERSION" ]; then
    TAG_NAME="v$VERSION"
    if ! git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
        git tag "$TAG_NAME"
        echo "🏷️  Created git tag: $TAG_NAME"
    else
        echo "ℹ️  Tag $TAG_NAME already exists."
    fi
fi

echo "✅ Version bumped, committed, and tagged successfully."'

echo "$HOOK_CONTENT" > "$HOOK_FILE"
chmod +x "$HOOK_FILE"
echo "✅ Post-commit hook updated successfully."


# ==========================================
# 2. SETUP PRE-PUSH HOOK (Fix & Format)
# ==========================================
PRE_PUSH_FILE=".husky/pre-push"
PRE_PUSH_CONTENT='#!/bin/sh

# --- 1. ENVIRONMENT SETUP ---
export PATH="$PATH:/c/Program Files/Git/usr/bin:/c/Program Files/nodejs:/c/xampp/php:/c/tools/php"

# --- 2. GUI DETECTION ---
if [ -z "$TERM" ] || [ "$TERM" = "dumb" ]; then
    echo "🖥️  GUI detected. Skipping pre-push checks."
    exit 0
fi

echo "🔄 Running pre-push checks..."

# --- 3. CHECK FOR NPM & RUN FIX ---
if command -v npm >/dev/null 2>&1; then
    if [ -f "package.json" ] && grep -q "\"fix\":" package.json; then
        echo "🛠️  Running npm run fix..."
        npm run fix
        if [ $? -ne 0 ]; then
            echo "❌ Error: Code style or type checks failed."
            echo "   Please run '\''npm run fix'\'' manually to see the errors."
            exit 1
        fi
    fi
fi

# --- 4. CHECK FOR COMPOSER & RUN FORMAT ---
if command -v composer >/dev/null 2>&1; then
    if [ -f "composer.json" ] && grep -q "\"format\":" composer.json; then
        echo "🐘 Running composer format..."
        composer format
        if [ $? -ne 0 ]; then
            echo "❌ Error: PHP coding standards failed."
            exit 1
        fi
    fi
fi

echo "✅ All checks passed. Pushing..."
exit 0'

echo "$PRE_PUSH_CONTENT" > "$PRE_PUSH_FILE"
chmod +x "$PRE_PUSH_FILE"
echo "✅ Pre-push hook updated successfully."

echo ""
echo "🎉 All hooks configured successfully!"
echo ""
echo "📋 Summary:"
echo "  ✓ post-commit: Auto-bumps version after successful commits"
echo "  ✓ pre-push: Runs linting and formatting before push"
echo ""
