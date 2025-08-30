import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RunwayHeader } from './RunwayHeader';
import * as useRunwayHook from '../hooks/useRunway';
import { RunwayData } from '../hooks/useRunway';

// Mock the useRunway hook
vi.mock('../hooks/useRunway');

const mockUseRunway = vi.spyOn(useRunwayHook, 'useRunway');

describe('RunwayHeader', () => {
  it('should display loading state', () => {
    mockUseRunway.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
    } as ReturnType<typeof useRunwayHook.useRunway>);

    render(<RunwayHeader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    mockUseRunway.mockReturnValue({
      data: undefined,
      error: new Error('Failed to fetch'),
      isLoading: false,
    } as ReturnType<typeof useRunwayHook.useRunway>);

    render(<RunwayHeader />);
    expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
  });

  it('should display "No data available" when there is no data', () => {
    mockUseRunway.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
    } as ReturnType<typeof useRunwayHook.useRunway>);

    render(<RunwayHeader />);
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('should render runway data correctly', () => {
    const testData: RunwayData = {
      balance_p: 382600,
      daily_burn_p: 4697,
      runway_days: 81.456,
      runway_ends_at: '2025-11-27',
      minutes_per_penny: 0.3065,
    };

    mockUseRunway.mockReturnValue({
      data: testData,
      error: null,
      isLoading: false,
    } as ReturnType<typeof useRunwayHook.useRunway>);

    render(<RunwayHeader />);

    expect(screen.getByText('81 days')).toBeInTheDocument();
    expect(screen.getByText(/Ends on 27 November 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/Cash Balance:/i)).toHaveTextContent('Cash Balance: £3,826.00');
    expect(screen.getByText(/Daily Burn:/i)).toHaveTextContent('Daily Burn: £46.97');
  });

  it('should display "Unlimited" for null runway_days', () => {
    const testData: RunwayData = {
      balance_p: 500000,
      daily_burn_p: 0,
      runway_days: null,
      runway_ends_at: null,
      minutes_per_penny: null,
    };

    mockUseRunway.mockReturnValue({
      data: testData,
      error: null,
      isLoading: false,
    } as ReturnType<typeof useRunwayHook.useRunway>);

    render(<RunwayHeader />);
    expect(screen.getByText('Unlimited')).toBeInTheDocument();
  });
});