import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiChevronDown, FiEdit2, FiLogOut, FiPlus, FiShield, FiTrash2, FiUsers } from "react-icons/fi";
import { getPlans } from "../services/api";
import AppHeader from "../components/AppHeader";
import AnimatedPage from "../components/AnimatedPage";
import Loader from "../components/Loader";
import MotionButton from "../components/MotionButton";
import { itemVariants, listVariants } from "../lib/motion";
import { useApp } from "../hooks/useApp";

const emptyForm = {
  name: "",
  premium: "",
  coverage: ""
};

const mockUsers = [
  { id: 101, name: "Aarav Singh", phone: "9876543210", email: "aarav@gmail.com", status: "active" },
  { id: 102, name: "Mira Patel", phone: "9988776655", email: "mira@gmail.com", status: "active" },
  { id: 103, name: "Rahul Verma", phone: "9123456780", email: "rahul@gmail.com", status: "blocked" }
];

const AdminPage = () => {
  const isLightMode = !document.documentElement.classList.contains("dark");
  const inputClass = `w-full rounded-2xl px-4 py-3 text-base outline-none transition focus:shadow-[0_0_0_3px_rgba(34,211,238,0.2)] ${
    isLightMode
      ? "border border-slate-300 bg-white text-slate-900 focus:border-cyan-500"
      : "border border-white/15 bg-slate-900/50 text-white focus:border-cyan-300"
  }`;

  const { actions } = useApp();
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [users] = useState(mockUsers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [conflictMessage, setConflictMessage] = useState("");
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    const loadPlans = async () => {
      setError("");
      try {
        const list = await getPlans();
        setPlans(Array.isArray(list) ? list : []);
      } catch (apiError) {
        setError(apiError.message || "Unable to load plans");
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const formIsValid = useMemo(() => {
    const premium = Number(form.premium);
    const coverage = Number(form.coverage);
    return form.name.trim().length > 1 && Number.isFinite(premium) && premium > 0 && Number.isFinite(coverage) && coverage > 0;
  }, [form]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSavePlan = () => {
    if (!formIsValid) {
      setError("Enter valid plan details.");
      return;
    }

    const nextPlan = {
      id: editingId || Date.now(),
      name: form.name.trim(),
      premium: Number(form.premium),
      coverage: Number(form.coverage)
    };

    setPlans((prev) => (editingId ? prev.map((plan) => (plan.id === editingId ? nextPlan : plan)) : [nextPlan, ...prev]));
    setError("");
    setConflictMessage("");
    actions.notify(editingId ? "Plan updated successfully" : "Plan added successfully", "success");
    resetForm();
  };

  const handleEdit = (plan) => {
    setForm({
      name: plan.name || "",
      premium: String(plan.premium ?? ""),
      coverage: String(plan.coverage ?? "")
    });
    setEditingId(plan.id);
    setConflictMessage("");
  };

  const handleDelete = (planId) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== planId));
    actions.notify("Plan deleted successfully", "success");
  };

  const simulateConflict = () => {
    setConflictMessage("Conflict detected: Plan was modified by another admin. Please refresh and retry.");
    actions.notify("Conflict detected while saving plan", "danger");
  };

  const clearConflict = () => {
    setConflictMessage("");
    setError("");
  };

  const applyTheme = (mode) => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    setThemeOpen(false);
  };

  if (loading) {
    return <Loader text="Loading admin dashboard..." />;
  }

  return (
    <AnimatedPage>
      <div className={isLightMode ? "rounded-3xl bg-[#f8fafc] p-4 text-[#1f2937]" : ""}>
        <AppHeader
          title="Admin"
          subtitle="Manage plans, users, and operational conflicts"
          titleClassName={isLightMode ? "text-black" : "text-white"}
          subtitleClassName={isLightMode ? "!text-slate-800 font-semibold" : "!text-slate-300"}
          rightSlot={
            <div className="flex items-center gap-2">
              <div className="relative">
                <MotionButton
                  onClick={() => setThemeOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold ${
                    isLightMode ? "border border-slate-300 bg-white text-slate-700 shadow-sm" : "border border-white/20 bg-slate-900/55 text-slate-200"
                  }`}
                >
                  {isLightMode ? "Light" : "Dark"}
                  <FiChevronDown size={14} />
                </MotionButton>
                {themeOpen ? (
                  <div className={`absolute right-0 top-12 z-20 w-32 rounded-xl p-2 ${isLightMode ? "border border-slate-200 bg-white shadow-lg" : "border border-white/15 bg-slate-900"}`}>
                    <button onClick={() => applyTheme("light")} className={`w-full rounded-md px-2 py-1.5 text-left text-xs ${isLightMode ? "bg-cyan-100 text-slate-900" : "text-slate-200 hover:bg-white/10"}`}>
                      Light Mode
                    </button>
                    <button onClick={() => applyTheme("dark")} className={`mt-1 w-full rounded-md px-2 py-1.5 text-left text-xs ${!isLightMode ? "bg-cyan-300 text-slate-900" : "text-slate-700 hover:bg-slate-100"}`}>
                      Dark Mode
                    </button>
                  </div>
                ) : null}
              </div>

              <MotionButton
                onClick={actions.logout}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                  isLightMode ? "border border-slate-300 bg-white text-slate-700 shadow-sm" : "border border-white/20 bg-slate-900/55 text-slate-200"
                }`}
              >
                <FiLogOut size={14} />
                Logout
              </MotionButton>
            </div>
          }
        />

        {(error || conflictMessage) && (
          <motion.div
            variants={itemVariants}
            className={`mb-4 rounded-xl p-3 text-sm ${isLightMode ? "border border-red-200 bg-red-50 text-red-700" : "border border-danger/35 bg-danger/10 text-danger"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p>{conflictMessage || error}</p>
              <button type="button" onClick={clearConflict} className="text-xs underline underline-offset-4">
                Clear
              </button>
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className={`mb-4 rounded-2xl p-4 ${isLightMode ? "border border-slate-200 bg-white shadow-md" : "border border-white/10 bg-slate-900/35"}`}>
          <div className={`mb-3 flex items-center gap-2 ${isLightMode ? "text-cyan-700" : "text-cyan-200"}`}>
            <FiPlus />
            <p className="font-semibold">{editingId ? "Edit Plan" : "Add Plan"}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input className={inputClass} placeholder="Plan name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            <input
              className={inputClass}
              placeholder="Premium"
              inputMode="numeric"
              value={form.premium}
              onChange={(e) => setForm((prev) => ({ ...prev, premium: e.target.value.replace(/[^\d]/g, "") }))}
            />
            <input
              className={inputClass}
              placeholder="Coverage"
              inputMode="numeric"
              value={form.coverage}
              onChange={(e) => setForm((prev) => ({ ...prev, coverage: e.target.value.replace(/[^\d]/g, "") }))}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <MotionButton
              onClick={handleSavePlan}
              disabled={!formIsValid}
              className="rounded-xl bg-gradient-to-r from-cyan-300 to-teal-300 px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {editingId ? "Update Plan" : "Add Plan"}
            </MotionButton>
            {editingId ? (
              <MotionButton onClick={resetForm} className={`rounded-xl px-4 py-2 text-sm ${isLightMode ? "border border-slate-300 bg-white text-slate-700" : "border border-white/20 bg-slate-900/55 text-slate-200"}`}>
                Cancel
              </MotionButton>
            ) : null}
            <MotionButton onClick={simulateConflict} className={`rounded-xl border px-4 py-2 text-sm ${isLightMode ? "border-amber-300 bg-amber-50 text-amber-700" : "border-amber-300/40 bg-amber-200/10 text-amber-200"}`}>
              Simulate Conflict
            </MotionButton>
          </div>
        </motion.div>

        <motion.div variants={listVariants} initial="initial" animate="animate" className="mb-4 space-y-3">
          <div className={`mb-1 flex items-center gap-2 ${isLightMode ? "text-cyan-700" : "text-cyan-200"}`}>
            <FiShield />
            <p className="font-semibold">Plan Management</p>
          </div>
          {plans.map((plan) => (
            <motion.div key={plan.id} variants={itemVariants} className={`rounded-2xl p-4 ${isLightMode ? "border border-slate-200 bg-white shadow-md" : "border border-white/10 bg-slate-900/40"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`font-semibold ${isLightMode ? "text-slate-900" : "text-white"}`}>{plan.name}</p>
                  <p className={`mt-1 text-sm ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>Premium: ₹{plan.premium}</p>
                  <p className={`text-sm ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>Coverage: ₹{plan.coverage}</p>
                </div>
                <div className="flex items-center gap-2">
                  <MotionButton onClick={() => handleEdit(plan)} className={`rounded-lg border p-2 ${isLightMode ? "border-cyan-300 bg-cyan-50 text-cyan-700" : "border-cyan-300/40 bg-cyan-300/10 text-cyan-200"}`}>
                    <FiEdit2 size={14} />
                  </MotionButton>
                  <MotionButton onClick={() => handleDelete(plan.id)} className="rounded-lg border border-danger/40 bg-danger/10 p-2 text-danger">
                    <FiTrash2 size={14} />
                  </MotionButton>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className={`rounded-2xl p-4 ${isLightMode ? "border border-slate-200 bg-white shadow-md" : "border border-white/10 bg-slate-900/40"}`}>
          <div className={`mb-3 flex items-center gap-2 ${isLightMode ? "text-cyan-700" : "text-cyan-200"}`}>
            <FiUsers />
            <p className="font-semibold">Users</p>
          </div>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className={`rounded-xl px-3 py-2.5 ${isLightMode ? "border border-slate-200 bg-slate-50" : "border border-white/10 bg-slate-900/55"}`}>
                <p className={`text-sm font-semibold ${isLightMode ? "text-slate-900" : "text-white"}`}>{user.name}</p>
                <p className={`text-xs ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>{user.phone}</p>
                <p className={`text-xs ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>{user.email}</p>
                <p
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    user.status === "active"
                      ? isLightMode
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-emerald-300/20 text-emerald-200"
                      : isLightMode
                        ? "bg-amber-100 text-amber-700"
                        : "bg-amber-300/20 text-amber-200"
                  }`}
                >
                  {user.status}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className={`mt-4 rounded-2xl p-4 text-sm ${isLightMode ? "border border-amber-200 bg-amber-50 text-amber-800" : "border border-amber-300/25 bg-amber-100/5 text-amber-100"}`}>
          <div className="mb-1 flex items-center gap-2">
            <FiAlertTriangle />
            <p className="font-semibold">Operational Notes</p>
          </div>
          <p>Use conflict simulation to verify error handling paths before backend conflict APIs are integrated.</p>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default AdminPage;
