#!/usr/bin/env node

import * as dotenv from 'dotenv';
import { supabase } from '../lib/supabase';
import { format, subHours, subDays } from 'date-fns';

dotenv.config();

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
}

async function checkDatabase(): Promise<HealthCheckResult> {
  try {
    // Test database connection
    const { error } = await supabase
      .from('crawler_runs')
      .select('id')
      .limit(1);

    if (error) {
      return {
        service: 'database',
        status: 'error',
        message: 'Database connection failed',
        details: error,
      };
    }

    return {
      service: 'database',
      status: 'healthy',
      message: 'Database connection successful',
    };
  } catch (error) {
    return {
      service: 'database',
      status: 'error',
      message: 'Database check failed',
      details: error,
    };
  }
}

async function checkCrawlerRuns(): Promise<HealthCheckResult[]> {
  const results: HealthCheckResult[] = [];
  const crawlerTypes = ['jobs', 'events', 'products'];
  
  // Check last run for each crawler type
  for (const type of crawlerTypes) {
    try {
      const { data: lastRun, error } = await supabase
        .from('crawler_runs')
        .select('*')
        .eq('crawler_type', type)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !lastRun) {
        results.push({
          service: `crawler-${type}`,
          status: 'warning',
          message: `No runs found for ${type} crawler`,
        });
        continue;
      }

      // Check if last run was successful
      if (!lastRun.success) {
        results.push({
          service: `crawler-${type}`,
          status: 'error',
          message: `Last ${type} crawler run failed`,
          details: {
            error: lastRun.error_message,
            failedAt: lastRun.completed_at,
          },
        });
        continue;
      }

      // Check if crawler has run recently (within 48 hours)
      const lastRunTime = new Date(lastRun.started_at);
      const hoursSinceLastRun = (Date.now() - lastRunTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastRun > 48) {
        results.push({
          service: `crawler-${type}`,
          status: 'warning',
          message: `${type} crawler hasn't run in ${Math.round(hoursSinceLastRun)} hours`,
          details: {
            lastRun: format(lastRunTime, 'yyyy-MM-dd HH:mm:ss'),
          },
        });
      } else {
        results.push({
          service: `crawler-${type}`,
          status: 'healthy',
          message: `${type} crawler is healthy`,
          details: {
            lastRun: format(lastRunTime, 'yyyy-MM-dd HH:mm:ss'),
            itemsFound: lastRun.items_found,
            duration: lastRun.completed_at ? 
              new Date(lastRun.completed_at).getTime() - lastRunTime.getTime() : null,
          },
        });
      }
    } catch (error) {
      results.push({
        service: `crawler-${type}`,
        status: 'error',
        message: `Failed to check ${type} crawler`,
        details: error,
      });
    }
  }

  return results;
}

async function checkRecentErrors(): Promise<HealthCheckResult> {
  try {
    // Check for errors in the last 24 hours
    const since = subHours(new Date(), 24).toISOString();
    
    const { data: errorRuns, error } = await supabase
      .from('crawler_runs')
      .select('crawler_type, error_message, completed_at')
      .eq('success', false)
      .gte('completed_at', since)
      .order('completed_at', { ascending: false });

    if (error) {
      return {
        service: 'error-monitoring',
        status: 'error',
        message: 'Failed to check recent errors',
        details: error,
      };
    }

    if (!errorRuns || errorRuns.length === 0) {
      return {
        service: 'error-monitoring',
        status: 'healthy',
        message: 'No errors in the last 24 hours',
      };
    }

    const errorsByType = errorRuns.reduce((acc, run) => {
      acc[run.crawler_type] = (acc[run.crawler_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      service: 'error-monitoring',
      status: errorRuns.length > 5 ? 'warning' : 'healthy',
      message: `${errorRuns.length} errors in the last 24 hours`,
      details: {
        errorsByType,
        recentErrors: errorRuns.slice(0, 5),
      },
    };
  } catch (error) {
    return {
      service: 'error-monitoring',
      status: 'error',
      message: 'Error monitoring check failed',
      details: error,
    };
  }
}

async function checkPerformance(): Promise<HealthCheckResult> {
  try {
    // Check average run times for the last 7 days
    const since = subDays(new Date(), 7).toISOString();
    
    const { data: runs, error } = await supabase
      .from('crawler_runs')
      .select('crawler_type, started_at, completed_at')
      .eq('success', true)
      .gte('started_at', since)
      .not('completed_at', 'is', null);

    if (error) {
      return {
        service: 'performance',
        status: 'error',
        message: 'Failed to check performance metrics',
        details: error,
      };
    }

    if (!runs || runs.length === 0) {
      return {
        service: 'performance',
        status: 'warning',
        message: 'No successful runs in the last 7 days',
      };
    }

    // Calculate average run times by type
    const avgRunTimes = runs.reduce((acc, run) => {
      const duration = new Date(run.completed_at!).getTime() - new Date(run.started_at).getTime();
      
      if (!acc[run.crawler_type]) {
        acc[run.crawler_type] = { total: 0, count: 0 };
      }
      
      acc[run.crawler_type]!.total += duration;
      acc[run.crawler_type]!.count += 1;
      
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const avgTimes = Object.entries(avgRunTimes).reduce((acc, [type, data]) => {
      acc[type] = Math.round(data.total / data.count / 1000 / 60); // minutes
      return acc;
    }, {} as Record<string, number>);

    // Check if any crawler is taking too long
    const slowCrawlers = Object.entries(avgTimes).filter(([_, avgMinutes]) => avgMinutes > 30);

    return {
      service: 'performance',
      status: slowCrawlers.length > 0 ? 'warning' : 'healthy',
      message: slowCrawlers.length > 0 
        ? `${slowCrawlers.length} crawler(s) running slowly`
        : 'All crawlers running within normal time',
      details: {
        averageRunTimes: avgTimes,
        slowCrawlers: slowCrawlers.map(([type, time]) => ({ type, avgMinutes: time })),
      },
    };
  } catch (error) {
    return {
      service: 'performance',
      status: 'error',
      message: 'Performance check failed',
      details: error,
    };
  }
}

async function runHealthCheck() {
  console.log('🏥 SpaceCrawler Health Check\n');
  console.log(`Timestamp: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} UTC\n`);

  const results: HealthCheckResult[] = [];

  // Run all health checks
  results.push(await checkDatabase());
  results.push(...await checkCrawlerRuns());
  results.push(await checkRecentErrors());
  results.push(await checkPerformance());

  // Display results
  let hasErrors = false;
  let hasWarnings = false;

  results.forEach(result => {
    const icon = result.status === 'healthy' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.service}: ${result.message}`);
    
    if (result.details && (result.status !== 'healthy' || process.env.VERBOSE)) {
      console.log(`   Details:`, JSON.stringify(result.details, null, 2));
    }
    
    if (result.status === 'error') hasErrors = true;
    if (result.status === 'warning') hasWarnings = true;
  });

  // Overall status
  console.log('\n📊 Overall Status:');
  if (hasErrors) {
    console.log('❌ System has errors that need attention');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  System has warnings that should be reviewed');
    process.exit(0);
  } else {
    console.log('✅ All systems healthy');
    process.exit(0);
  }
}

// Run the health check
runHealthCheck().catch(error => {
  console.error('Health check failed:', error);
  process.exit(1);
});