import { getCategories, getProjects, getPeople } from "@/app/actions/catalog";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "../components/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/login");
  
  const role = (session?.user as any)?.role as "ADMIN" | "USER";
  const userId = Number((session?.user as any)?.userId || 0);
  const userName = session?.user?.name || "";
  const isAdmin = role === "ADMIN";

  // Data fetching based on role
  const whereClause = isAdmin ? {} : { UserID: userId };
  
  const [categories, projects, people, expenseData, incomeData] = await Promise.all([
    getCategories(role, userId),
    getProjects(role),
    getPeople(role, userId),
    prisma.expenses.findMany({ where: whereClause, select: { Amount: true, ExpenseDate: true } }),
    prisma.incomes.findMany({ where: whereClause, select: { Amount: true, IncomeDate: true } }),
  ]);

  const totalExpense = expenseData.reduce((sum, e) => sum + Number(e.Amount), 0);
  const totalIncome = incomeData.reduce((sum, i) => sum + Number(i.Amount), 0);
  const netWorth = totalIncome - totalExpense;

  // Group data by month for dynamic chart (Last 6 Months)
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.getMonth();
    const year = d.getFullYear();
    
    const mExpenses = expenseData.filter(e => e.ExpenseDate.getMonth() === month && e.ExpenseDate.getFullYear() === year).reduce((sum, e) => sum + Number(e.Amount), 0);
    const mIncomes = incomeData.filter(i => i.IncomeDate.getMonth() === month && i.IncomeDate.getFullYear() === year).reduce((sum, i) => sum + Number(i.Amount), 0);
    
    return { label: d.toLocaleString('default', { month: 'short' }), expense: mExpenses, income: mIncomes };
  });

  const maxChartVal = Math.max(...chartData.map(d => Math.max(d.expense, d.income)), 1);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="h3 fw-bold mb-1">{isAdmin ? "Admin Dashboard" : "User Dashboard"}</h1>
          <p className="text-muted mb-0">Hello, {userName}. Welcome back!</p>
        </div>
        <LogoutButton />
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card shadow-sm h-100 p-3">
            <small className="text-muted fw-medium">{isAdmin ? "Global Net Worth" : "Saved Income"}</small>
            <h3 className="fw-bold mt-2">₹ {netWorth.toLocaleString()}</h3>
            <span className="text-primary small fw-bold">Current Balance</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm h-100 p-3 border-start border-success border-4">
            <small className="text-muted fw-medium">{isAdmin ? "Total System Income" : "Your Assigned Income"}</small>
            <h3 className="fw-bold mt-2">₹ {totalIncome.toLocaleString()}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm h-100 p-3 border-start border-danger border-4">
            <small className="text-muted fw-medium">{isAdmin ? "Total System Expenses" : "Your Total Expenses"}</small>
            <h3 className="fw-bold mt-2">₹ {totalExpense.toLocaleString()}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm h-100 p-3">
            <small className="text-muted fw-medium">Active Items</small>
            <div className="d-flex gap-3 mt-2">
              <div><h4 className="fw-bold mb-0">{categories.length}</h4><small className="text-muted">Cats</small></div>
              <div className="vr"></div>
              <div><h4 className="fw-bold mb-0">{projects.length}</h4><small className="text-muted">Projs</small></div>
              {isAdmin && (
                <>
                  <div className="vr"></div>
                  <div><h4 className="fw-bold mb-0">{people.length}</h4><small className="text-muted">Users</small></div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-8">
          <div className="card shadow-sm p-4" style={{ minHeight: '300px' }}>
            <h6 className="fw-bold mb-4">6-Month Trend: Income vs Expenses</h6>
            <div className="d-flex align-items-end gap-3 h-100 justify-content-around px-2 pt-4">
              {chartData.map((data, i) => {
                const incHeight = (data.income / maxChartVal) * 100;
                const expHeight = (data.expense / maxChartVal) * 100;
                return (
                  <div key={i} className="d-flex flex-column align-items-center justify-content-end h-100 w-100">
                    <div className="d-flex align-items-end gap-1 w-100 justify-content-center" style={{ height: '200px' }}>
                      <div className="bg-success rounded-top" style={{ height: `${incHeight}%`, width: '20px', opacity: 0.8 }} title={`Income: ₹${data.income}`}></div>
                      <div className="bg-danger rounded-top" style={{ height: `${expHeight}%`, width: '20px', opacity: 0.8 }} title={`Expense: ₹${data.expense}`}></div>
                    </div>
                    <small className="text-muted mt-2 fw-bold">{data.label}</small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}