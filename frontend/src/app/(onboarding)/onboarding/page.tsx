"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Shield } from "lucide-react";

const STEPS = ["Demographics", "Financials", "Scenarios", "Goals"];

const SCENARIOS = [
  { key: "market_drop", question: "If the market dropped 20% tomorrow, what would you do?" },
  { key: "windfall", question: "You receive an unexpected bonus. How would you invest it?" },
  { key: "time_horizon", question: "How long can you wait before needing your invested money?" },
  { key: "loss_tolerance", question: "What level of loss in a year would make you uncomfortable?" },
  { key: "volatility", question: "How do you feel about day-to-day portfolio fluctuations?" },
];

const SCENARIO_OPTIONS = [
  { value: "1", label: "Very Conservative" },
  { value: "2", label: "Conservative" },
  { value: "3", label: "Moderate" },
  { value: "4", label: "Aggressive" },
  { value: "5", label: "Very Aggressive" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; persona: string } | null>(null);
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  // Form data
  const [age, setAge] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [savings, setSavings] = useState("");
  const [liabilities, setLiabilities] = useState("");
  const [scenarios, setScenarios] = useState<Record<string, string>>({});
  const [goals, setGoals] = useState([{ goal_name: "", target_amount: "", horizon_years: "" }]);

  const handleScenarioChange = (key: string, value: string) => {
    setScenarios((prev) => ({ ...prev, [key]: value }));
  };

  const addGoal = () => {
    setGoals([...goals, { goal_name: "", target_amount: "", horizon_years: "" }]);
  };

  const updateGoal = (index: number, field: string, value: string) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const scenarioResponses: Record<string, number> = {};
      for (const [key, val] of Object.entries(scenarios)) {
        scenarioResponses[key] = parseInt(val) || 3;
      }

      const validGoals = goals
        .filter((g) => g.goal_name)
        .map((g) => ({
          goal_name: g.goal_name,
          target_amount: parseFloat(g.target_amount) || 0,
          horizon_years: parseInt(g.horizon_years) || 1,
        }));

      const res = await api.post("/onboarding/risk-profile", {
        age: parseInt(age) || null,
        monthly_income: parseFloat(monthlyIncome) || null,
        savings: parseFloat(savings) || null,
        liabilities: parseFloat(liabilities) || null,
        scenario_responses: scenarioResponses,
        goals: validGoals,
      });

      setResult({ score: res.data.risk_score, persona: res.data.risk_persona });

      if (user) {
        setUser({ ...user, onboarding_completed: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-black p-4">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-brand-lime/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-brand-lime" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2">Your Risk Profile</h2>
          <div className="text-5xl font-heading font-bold text-brand-lime my-4">{result.score}/10</div>
          <p className="text-lg font-medium mb-1">{result.persona}</p>
          <p className="text-sm text-gray-500 mb-6">
            This score helps us tailor investment recommendations to your comfort level.
          </p>
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-black p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-heading font-bold">
            Invest<span className="text-brand-lime">.me</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Let&apos;s understand your risk appetite</p>
        </div>

        <ProgressBar currentStep={step} totalSteps={STEPS.length} labels={STEPS} />

        <Card>
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold">Demographics</h3>
              <Input id="age" label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold">Financial Details</h3>
              <Input id="income" label="Monthly Income" type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} />
              <Input id="savings" label="Total Savings" type="number" value={savings} onChange={(e) => setSavings(e.target.value)} />
              <Input id="liabilities" label="Total Liabilities" type="number" value={liabilities} onChange={(e) => setLiabilities(e.target.value)} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold">Risk Scenarios</h3>
              {SCENARIOS.map((s) => (
                <Select
                  key={s.key}
                  id={s.key}
                  label={s.question}
                  options={SCENARIO_OPTIONS}
                  value={scenarios[s.key] || "3"}
                  onChange={(e) => handleScenarioChange(s.key, e.target.value)}
                />
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold">Financial Goals</h3>
              {goals.map((g, i) => (
                <div key={i} className="space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <Input
                    id={`goal-name-${i}`}
                    label="Goal Name"
                    placeholder="e.g., Retirement, House"
                    value={g.goal_name}
                    onChange={(e) => updateGoal(i, "goal_name", e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id={`goal-amount-${i}`}
                      label="Target Amount"
                      type="number"
                      value={g.target_amount}
                      onChange={(e) => updateGoal(i, "target_amount", e.target.value)}
                    />
                    <Input
                      id={`goal-years-${i}`}
                      label="Years"
                      type="number"
                      value={g.horizon_years}
                      onChange={(e) => updateGoal(i, "horizon_years", e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addGoal}>
                + Add Goal
              </Button>
            </div>
          )}

          <div className="flex justify-between mt-6">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <div className="ml-auto">
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep(step + 1)}>Next</Button>
              ) : (
                <Button onClick={handleSubmit} loading={loading}>
                  Complete
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
