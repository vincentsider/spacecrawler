#!/bin/bash

# SpaceCrawler Management Script
# This script provides easy management commands for the crawler service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Change to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

# Function to display usage
usage() {
    echo -e "${BLUE}SpaceCrawler Management Script${NC}"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  start               Start the crawler scheduler service"
    echo "  stop                Stop the crawler scheduler service"
    echo "  restart             Restart the crawler scheduler service"
    echo "  status              Check scheduler status"
    echo "  health              Run health checks"
    echo "  run <type>          Run a specific crawler (jobs, events, products)"
    echo "  run-all             Run all crawlers once"
    echo "  logs [lines]        Show recent logs (default: 50 lines)"
    echo "  build               Build the crawler service"
    echo "  deploy              Deploy using Docker"
    echo "  dev                 Start in development mode"
    echo ""
}

# Function to check if service is running
check_service() {
    if pgrep -f "crawler.*schedule" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Main command handling
case "$1" in
    start)
        echo -e "${BLUE}Starting crawler scheduler...${NC}"
        cd apps/crawler
        
        if check_service; then
            echo -e "${YELLOW}Crawler scheduler is already running${NC}"
            exit 1
        fi
        
        if [ "$2" == "-d" ] || [ "$2" == "--daemon" ]; then
            nohup npm run schedule > ../../logs/crawler.log 2>&1 &
            echo $! > ../../logs/crawler.pid
            echo -e "${GREEN}Crawler scheduler started in background (PID: $(cat ../../logs/crawler.pid))${NC}"
        else
            npm run schedule
        fi
        ;;
        
    stop)
        echo -e "${BLUE}Stopping crawler scheduler...${NC}"
        
        if [ -f logs/crawler.pid ]; then
            PID=$(cat logs/crawler.pid)
            if kill -0 $PID 2>/dev/null; then
                kill $PID
                rm logs/crawler.pid
                echo -e "${GREEN}Crawler scheduler stopped${NC}"
            else
                echo -e "${YELLOW}Crawler scheduler not running (stale PID file)${NC}"
                rm logs/crawler.pid
            fi
        else
            if check_service; then
                pkill -f "crawler.*schedule"
                echo -e "${GREEN}Crawler scheduler stopped${NC}"
            else
                echo -e "${YELLOW}Crawler scheduler is not running${NC}"
            fi
        fi
        ;;
        
    restart)
        $0 stop
        sleep 2
        $0 start "$2"
        ;;
        
    status)
        echo -e "${BLUE}Checking crawler status...${NC}"
        cd apps/crawler
        npm run status
        ;;
        
    health)
        echo -e "${BLUE}Running health checks...${NC}"
        cd apps/crawler
        npx tsx src/scripts/health-check.ts
        ;;
        
    run)
        if [ -z "$2" ]; then
            echo -e "${RED}Error: Please specify crawler type (jobs, events, products)${NC}"
            exit 1
        fi
        echo -e "${BLUE}Running $2 crawler...${NC}"
        cd apps/crawler
        npm run run "$2"
        ;;
        
    run-all)
        echo -e "${BLUE}Running all crawlers...${NC}"
        cd apps/crawler
        npm run crawl:all
        ;;
        
    logs)
        LINES=${2:-50}
        echo -e "${BLUE}Showing last $LINES lines of logs...${NC}"
        
        if [ -f logs/crawler.log ]; then
            tail -n $LINES logs/crawler.log
        else
            echo -e "${YELLOW}No log file found. Running in foreground or logs directory not created.${NC}"
            echo "Checking system logs..."
            cd apps/crawler
            npm run status
        fi
        ;;
        
    build)
        echo -e "${BLUE}Building crawler service...${NC}"
        cd apps/crawler
        npm run build
        echo -e "${GREEN}Build completed${NC}"
        ;;
        
    deploy)
        echo -e "${BLUE}Deploying crawler service with Docker...${NC}"
        
        # Check if .env file exists
        if [ ! -f apps/crawler/.env ]; then
            echo -e "${RED}Error: apps/crawler/.env file not found${NC}"
            echo "Please copy apps/crawler/.env.example to apps/crawler/.env and configure it"
            exit 1
        fi
        
        # Build and run with Docker Compose
        docker-compose up -d crawler
        echo -e "${GREEN}Crawler deployed with Docker${NC}"
        ;;
        
    dev)
        echo -e "${BLUE}Starting crawler in development mode...${NC}"
        cd apps/crawler
        npm run schedule:dev
        ;;
        
    *)
        usage
        exit 1
        ;;
esac