export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
        <p className="text-slate-500 mb-6">Manage your account preferences and billing.</p>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Subscription</h2>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <p className="font-medium text-slate-900 dark:text-slate-100">Free Tier</p>
              <p className="text-sm text-slate-500">Stripe integration coming soon.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
