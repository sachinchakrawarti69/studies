@echo off
chcp 65001 >nul
title Git Commands for Studies
color 0A

:: ============================================
:: GIT COMMANDS BATCH FILE
:: Usage: git [command]
:: ============================================

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="?" goto help

:: Git Commands
if "%1"=="status" goto status
if "%1"=="st" goto status
if "%1"=="add" goto add
if "%1"=="commit" goto commit
if "%1"=="cm" goto commit
if "%1"=="push" goto push
if "%1"=="pull" goto pull
if "%1"=="log" goto log
if "%1"=="branch" goto branch
if "%1"=="br" goto branch
if "%1"=="checkout" goto checkout
if "%1"=="co" goto checkout
if "%1"=="merge" goto merge
if "%1"=="stash" goto stash
if "%1"=="stash-pop" goto stashpop
if "%1"=="reset" goto reset
if "%1"=="clean" goto clean
if "%1"=="diff" goto diff
if "%1"=="remote" goto remote
if "%1"=="fetch" goto fetch
if "%1"=="rebase" goto rebase
if "%1"=="tag" goto tag
if "%1"=="all" goto all
if "%1"=="help" goto help

:: Auto-Push Commands
if "%1"=="start" goto start
if "%1"=="dev" goto dev
if "%1"=="push-all" goto pushall
if "%1"=="pa" goto pushall
if "%1"=="report" goto report
if "%1"=="test" goto test
if "%1"=="status-system" goto statussystem
if "%1"=="ss" goto statussystem

goto help

:status
echo.
echo ========================================
echo           GIT STATUS
echo ========================================
cd auto-push
npm run git:status
goto end

:add
echo.
echo ========================================
echo           GIT ADD
echo ========================================
cd auto-push
npm run git:add
goto end

:commit
echo.
echo ========================================
echo           GIT COMMIT
echo ========================================
cd auto-push
npm run git:commit
goto end

:push
echo.
echo ========================================
echo           GIT PUSH
echo ========================================
cd auto-push
npm run git:push
goto end

:pull
echo.
echo ========================================
echo           GIT PULL
echo ========================================
cd auto-push
npm run git:pull
goto end

:log
echo.
echo ========================================
echo           GIT LOG
echo ========================================
cd auto-push
npm run git:log
goto end

:branch
echo.
echo ========================================
echo           GIT BRANCHES
echo ========================================
cd auto-push
npm run git:branch
goto end

:checkout
echo.
echo ========================================
echo           GIT CHECKOUT
echo ========================================
cd auto-push
npm run git:checkout
goto end

:merge
echo.
echo ========================================
echo           GIT MERGE
echo ========================================
cd auto-push
npm run git:merge
goto end

:stash
echo.
echo ========================================
echo           GIT STASH
echo ========================================
cd auto-push
npm run git:stash
goto end

:stashpop
echo.
echo ========================================
echo           GIT STASH POP
echo ========================================
cd auto-push
npm run git:stash-pop
goto end

:reset
echo.
echo ========================================
echo           GIT RESET
echo ========================================
cd auto-push
npm run git:reset
goto end

:clean
echo.
echo ========================================
echo           GIT CLEAN
echo ========================================
cd auto-push
npm run git:clean
goto end

:diff
echo.
echo ========================================
echo           GIT DIFF
echo ========================================
cd auto-push
npm run git:diff
goto end

:remote
echo.
echo ========================================
echo           GIT REMOTE
echo ========================================
cd auto-push
npm run git:remote
goto end

:fetch
echo.
echo ========================================
echo           GIT FETCH
echo ========================================
cd auto-push
npm run git:fetch
goto end

:rebase
echo.
echo ========================================
echo           GIT REBASE
echo ========================================
cd auto-push
npm run git:rebase
goto end

:tag
echo.
echo ========================================
echo           GIT TAG
echo ========================================
cd auto-push
npm run git:tag
goto end

:all
echo.
echo ========================================
echo           GIT ALL INFO
echo ========================================
cd auto-push
npm run git:all
goto end

:start
echo.
echo ========================================
echo      STARTING AUTO-PUSH WATCHER
echo ========================================
echo.
echo Root Directory: %CD%
echo.
echo Press Ctrl+C to stop
echo.
cd auto-push
npm start
goto end

:dev
echo.
echo ========================================
echo   STARTING AUTO-PUSH (DEV MODE)
echo ========================================
echo.
cd auto-push
npm run dev
goto end

:pushall
echo.
echo ========================================
echo     MANUAL PUSH ALL CHANGES
echo ========================================
cd auto-push
npm run push
goto end

:report
echo.
echo ========================================
echo     GENERATING REPORTS
echo ========================================
cd auto-push
npm run report
goto end

:test
echo.
echo ========================================
echo     RUNNING SYSTEM TESTS
echo ========================================
cd auto-push
npm run test
goto end

:statussystem
echo.
echo ========================================
echo     SYSTEM STATUS
echo ========================================
cd auto-push
npm run status
goto end

:help
echo.
echo ============================================================
echo           GIT & AUTO-PUSH COMMANDS
echo ============================================================
echo.
echo GIT COMMANDS:
echo   git status     or  git st    - Show repository status
echo   git add                      - Stage all changes
echo   git commit    or  git cm     - Commit staged changes
echo   git push                     - Push to remote
echo   git pull                     - Pull from remote
echo   git log                      - Show commit history
echo   git branch    or  git br     - List branches
echo   git checkout  or  git co     - Switch branches
echo   git merge                     - Merge branches
echo   git stash                     - Stash changes
echo   git stash-pop                 - Apply stashed changes
echo   git reset                     - Unstage changes
echo   git clean                     - Remove untracked files
echo   git diff                      - Show file differences
echo   git remote                    - Show remote repositories
echo   git fetch                     - Fetch from remote
echo   git rebase                    - Rebase current branch
echo   git tag                       - Create a tag
echo   git all                       - Show all info
echo.
echo AUTO-PUSH COMMANDS:
echo   git start                     - Start auto-push watcher
echo   git dev                       - Start with auto-restart
echo   git push-all or git pa        - Manual push all changes
echo   git report                    - Generate reports
echo   git test                      - Test the system
echo   git status-system or git ss   - Show system status
echo.
echo EXAMPLES:
echo   git status      - Check current status
echo   git add         - Stage all changes
echo   git commit      - Commit with message
echo   git push        - Push to remote
echo   git start       - Start auto-push watcher
echo   git log         - View commit history
echo   git all         - Show everything
echo.
echo ============================================================
goto end

:end
echo.
pause