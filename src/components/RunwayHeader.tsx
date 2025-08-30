import { useRunway } from '../hooks/useRunway';

export function RunwayHeader() {
  const { data, error, isLoading } = useRunway();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>No data available.</div>;
  }

  const { runway_days, runway_ends_at, daily_burn_p, balance_p } = data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount / 100);
  };

  const monthlyBurn = daily_burn_p ? daily_burn_p * 30 : 0;

  return (
    <header className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-5xl font-bold">
          {runway_days !== null ? `${Math.floor(runway_days)} days` : 'Unlimited'}
        </h1>
        <p className="text-gray-400">
          {runway_ends_at ? `Ends on ${new Date(runway_ends_at).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}` : 'Your runway is looking good!'}
        </p>
      </div>
      <div className="mt-4 flex justify-between text-lg">
        <div>
          <span className="font-semibold">Cash Balance:</span> {formatCurrency(balance_p || 0)}
        </div>
        <div>
          <span className="font-semibold">Daily Burn:</span> {formatCurrency(daily_burn_p || 0)}
          <span className="text-gray-400 text-sm">
            {' '}(≈ {formatCurrency(monthlyBurn)} / month)
          </span>
        </div>
      </div>
    </header>
  );
}
