import { getCategories, getProjects, getPeople } from "@/app/actions/catalog";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardChart from "../components/DashboardChart";
import AnalyticsCharts from "../components/AnalyticsCharts";

export default async function DashboardPage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/login");

  const role = (session?.user as any)?.role as "ADMIN" | "USER";
  const userId = Number((session?.user as any)?.userId || 0);
  const peopleId = Number((session?.user as any)?.peopleId || 0);
  const parentUserId = Number((session?.user as any)?.parentUserId || 0);
  const userName = session?.user?.name || "";
  const isAdmin = role === "ADMIN";

  const expenseWhere = isAdmin ? {} : { PeopleID: peopleId };
  const incomeWhere = isAdmin ? {} : { PeopleID: peopleId };

  const [categories, projects, people, expenseData, incomeData] =
    await Promise.all([
      getCategories(role, parentUserId),
      getProjects(role, parentUserId),
      getPeople(role, parentUserId),
      prisma.expenses.findMany({
        where: expenseWhere,
        select: { Amount: true, ExpenseDate: true, CategoryID: true, ProjectID: true },
      }),
      prisma.incomes.findMany({
        where: incomeWhere,
        select: { Amount: true, IncomeDate: true, CategoryID: true, ProjectID: true },
      }),
    ]);

  const totalExpense = expenseData.reduce(
    (sum, e) => sum + Number(e.Amount),
    0,
  );
  const totalIncome = incomeData.reduce(
    (sum, i) => sum + Number(i.Amount),
    0,
  );
  const netWorth = totalIncome - totalExpense;

  const incomesForChart = incomeData.map((i) => ({
    amount: Number(i.Amount),
    date: i.IncomeDate.toISOString(),
  }));

  const expensesForChart = expenseData.map((e) => ({
    amount: Number(e.Amount),
    date: e.ExpenseDate.toISOString(),
  }));

  // Aggregation for Category Pie Chart
  const categoryDataMap: Record<number, number> = {};
  expenseData.forEach((e) => {
    if (e.CategoryID) {
      categoryDataMap[e.CategoryID] = (categoryDataMap[e.CategoryID] || 0) + Number(e.Amount);
    }
  });
  
  const categoryChartData = Object.entries(categoryDataMap)
    .map(([id, val]) => {
      const cat = categories.find((c) => c.CategoryID === Number(id));
      return { name: cat ? cat.CategoryName : "Unknown", value: val };
    })
    .sort((a, b) => b.value - a.value); // Sort highest expenses first

  // Aggregation for Project Bar Chart
  const projectDataMap: Record<number, { income: number; expense: number }> = {};
  
  incomeData.forEach((i) => {
    if (i.ProjectID) {
      if (!projectDataMap[i.ProjectID]) projectDataMap[i.ProjectID] = { income: 0, expense: 0 };
      projectDataMap[i.ProjectID].income += Number(i.Amount);
    }
  });
  
  expenseData.forEach((e) => {
    if (e.ProjectID) {
      if (!projectDataMap[e.ProjectID]) projectDataMap[e.ProjectID] = { income: 0, expense: 0 };
      projectDataMap[e.ProjectID].expense += Number(e.Amount);
    }
  });

  const projectChartData = Object.entries(projectDataMap).map(([id, data]) => {
    const proj = projects.find((p) => p.ProjectID === Number(id));
    return { name: proj ? proj.ProjectName : "Unknown", income: data.income, expense: data.expense };
  });

  return (
    <div>
      <div 
        className="mb-5 p-4 rounded-4 shadow-sm" 
        style={{ 
          background: "linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)", 
          color: "white" 
        }}
      >
        <h1 className="display-6 fw-bold mb-2">
          {isAdmin ? userName : "User Dashboard"}
        </h1>
        <p className="fs-5 mb-0" style={{ opacity: 0.9 }}>
          Hello, {userName}. Welcome back! Let's track your finances today.
        </p>
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

      <div className="row g-4 mb-4">
        <div className="col-md-12">
          <DashboardChart incomes={incomesForChart} expenses={expensesForChart} />
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-12">
          <AnalyticsCharts categoryData={categoryChartData} projectData={projectChartData} />
        </div>
      </div>
    </div>
  );
}