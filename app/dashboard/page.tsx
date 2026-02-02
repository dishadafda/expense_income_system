import { getCategories, getProjects } from "@/app/actions/catalog";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "../components/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/login");
  }
  
  const role = (session?.user as any)?.role as "ADMIN" | "USER" | undefined;
  const userName = session?.user?.name || "";

  const [categories, projects, expenseTotal, incomeTotal] = await Promise.all([
    getCategories(),
    getProjects(),
    prisma.expenses.aggregate({
      _sum: { Amount: true },
    }),
    prisma.incomes.aggregate({
      _sum: { Amount: true },
    }),
  ]);

  const totalCategories = categories.length;
  const totalProjects = projects.length;
  const totalExpense = expenseTotal._sum.Amount || 0;
  const totalIncome = incomeTotal._sum.Amount || 0;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1 text-black">Dashboard</h1>
          <p className="text-muted mb-0">
            Welcome back, {userName || "User"} ({role || "USER"})
          </p>
        </div>
        <div>
           <LogoutButton />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="h6 text-muted mb-2">Total Income</h2>
              <p className="h4 mb-0 text-success">
                ₹ {Number(totalIncome).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="h6 text-muted mb-2">Total Expense</h2>
              <p className="h4 mb-0 text-danger">
                ₹ {Number(totalExpense).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="h6 text-muted mb-2">Active Categories</h2>
              <p className="h4 mb-0">{totalCategories}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="h6 text-muted mb-2">Active Projects</h2>
              <p className="h4 mb-0">{totalProjects}</p>
            </div>
          </div>
        </div>
      </div>

      {role === "ADMIN" && (
        <div className="alert alert-info mt-3 mb-0" role="alert">
          You are logged in as <strong>Admin</strong>. You can manage master
          data (Categories, Projects, People) and all transactions.
        </div>
      )}
    </div>
  );
}

