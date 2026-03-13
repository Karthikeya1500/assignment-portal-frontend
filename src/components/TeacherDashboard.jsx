import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5001/api/assignments";

function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("All");

  // modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [subsOpen, setSubsOpen] = useState(false);

  const [selected, setSelected] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);

  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });

  const headers = { Authorization: `Bearer ${user?.token}` };
  const userName = user?.name || "Teacher";

  useEffect(() => {
    if (!user || user.role !== "teacher") {
      navigate("/login");
      return;
    }
    loadAssignments();
  }, []);

  useEffect(() => {
    if (tab === "All") setFiltered(assignments);
    else setFiltered(assignments.filter((a) => a.status === (tab === "Drafts" ? "Draft" : tab)));
  }, [assignments, tab]);

  async function loadAssignments() {
    try {
      const { data } = await axios.get(API, { headers });
      setAssignments(data);
    } catch (err) {
      setError("Could not load assignments.");
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  /* ---- CRUD helpers ---- */
  async function handleCreate(e) {
    e.preventDefault();
    try {
      await axios.post(API, form, { headers });
      setCreateOpen(false);
      setForm({ title: "", description: "", dueDate: "" });
      loadAssignments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create assignment.");
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    try {
      await axios.put(`${API}/${selected._id}`, form, { headers });
      setEditOpen(false);
      setForm({ title: "", description: "", dueDate: "" });
      loadAssignments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update.");
    }
  }

  function openEdit(a) {
    setSelected(a);
    setForm({
      title: a.title,
      description: a.description,
      dueDate: a.dueDate ? a.dueDate.split("T")[0] : "",
    });
    setEditOpen(true);
  }

  async function changeStatus(id, action) {
    try {
      await axios.put(`${API}/${id}/${action}`, {}, { headers });
      loadAssignments();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action}.`);
    }
  }

  async function deleteAssignment(id) {
    if (!window.confirm("Delete this assignment and all its submissions?")) return;
    try {
      await axios.delete(`${API}/${id}`, { headers });
      loadAssignments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete.");
    }
  }

  async function viewSubmissions(a) {
    setSelected(a);
    setSubsLoading(true);
    setSubsOpen(true);
    try {
      const { data } = await axios.get(`${API}/${a._id}/submissions`, { headers });
      setSubmissions(data);
    } catch {
      alert("Failed to load submissions.");
    } finally {
      setSubsLoading(false);
    }
  }

  async function markReviewed(assignmentId, subId) {
    try {
      await axios.put(`${API}/${assignmentId}/submissions/${subId}/review`, {}, { headers });
      // refresh the submissions list in modal
      const { data } = await axios.get(`${API}/${assignmentId}/submissions`, { headers });
      setSubmissions(data);
    } catch {
      alert("Failed to mark as reviewed.");
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const tabs = ["All", "Published", "Drafts", "Completed"];
  const counts = {
    All: assignments.length,
    Published: assignments.filter((a) => a.status === "Published").length,
    Drafts: assignments.filter((a) => a.status === "Draft").length,
    Completed: assignments.filter((a) => a.status === "Completed").length,
  };

  // dashboard analytics
  const totalSubmissions = assignments.reduce((s, a) => s + (a.submissionCount || 0), 0);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 text-slate-900 antialiased">
      {/* header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white lg:px-20 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center text-white rounded-lg size-10 bg-primary">
            <span className="material-symbols-outlined">school</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-primary">Assignment Portal</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="items-center hidden gap-6 mr-6 md:flex">
            <span className="pb-1 text-sm font-medium border-b-2 text-primary border-primary">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3 pl-2">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-semibold leading-none">{userName}</p>
              <p className="mt-1 text-xs text-slate-500">Instructor</p>
            </div>
            <div className="flex items-center justify-center text-primary font-bold border-2 rounded-full size-10 bg-primary/20 border-primary/30 text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl px-6 py-8 mx-auto flex-1 lg:py-12">
        {/* analytics cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total", value: assignments.length, icon: "assignment", color: "text-primary bg-primary/10" },
            { label: "Published", value: counts.Published, icon: "publish", color: "text-green-600 bg-green-100" },
            { label: "Drafts", value: counts.Drafts, icon: "edit_note", color: "text-amber-600 bg-amber-100" },
            { label: "Submissions", value: totalSubmissions, icon: "grading", color: "text-indigo-600 bg-indigo-100" },
          ].map((card) => (
            <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">{card.label}</span>
                <div className={`flex items-center justify-center size-9 rounded-lg ${card.color}`}>
                  <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
                </div>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        {/* title + create btn */}
        <div className="flex flex-col gap-6 mb-10 md:flex-row md:items-end justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
            <p className="max-w-md text-slate-500">
              Manage your assignments and track student progress.
            </p>
          </div>
          <button
            onClick={() => {
              setForm({ title: "", description: "", dueDate: "" });
              setCreateOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create Assignment
          </button>
        </div>

        {/* tabs */}
        <div className="flex items-center border-b border-slate-200 mb-6 overflow-x-auto">
          <div className="flex gap-8">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  tab === t
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-slate-500 hover:text-primary"
                }`}
              >
                {t === "All" ? "All Assignments" : t} ({counts[t]})
              </button>
            ))}
          </div>
        </div>

        {/* table */}
        <div className="overflow-hidden bg-white border rounded-xl border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-500">
                    Assignment Title
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-500">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-500">
                    Submissions
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-right uppercase text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      <span className="material-symbols-outlined animate-spin text-3xl">
                        progress_activity
                      </span>
                      <p className="mt-2">Loading...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">
                        assignment
                      </span>
                      <p className="mt-2">
                        {tab === "All"
                          ? "No assignments yet. Create your first one!"
                          : `No ${tab.toLowerCase()} assignments.`}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <span className="font-semibold">{a.title}</span>
                        <span className="block mt-1 text-xs text-slate-400">
                          {a.description}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            a.status === "Published"
                              ? "bg-green-100 text-green-700"
                              : a.status === "Completed"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full mr-1.5 ${
                              a.status === "Published"
                                ? "bg-green-600"
                                : a.status === "Completed"
                                ? "bg-slate-600"
                                : "bg-amber-600"
                            }`}
                          />
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {new Date(a.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-5 text-sm font-medium">
                        {a.submissionCount || 0}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {a.status === "Draft" && (
                            <>
                              <button
                                onClick={() => changeStatus(a._id, "publish")}
                                className="px-3 py-1.5 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                              >
                                Publish
                              </button>
                              <button
                                onClick={() => openEdit(a)}
                                className="px-3 py-1.5 text-xs font-semibold text-primary hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteAssignment(a._id)}
                                className="px-2 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  delete
                                </span>
                              </button>
                            </>
                          )}
                          {a.status === "Published" && (
                            <>
                              <button
                                onClick={() => viewSubmissions(a)}
                                className="px-3 py-1.5 text-xs font-semibold text-primary hover:underline"
                              >
                                View Results
                              </button>
                              <button
                                onClick={() => openEdit(a)}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => changeStatus(a._id, "complete")}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                              >
                                Complete
                              </button>
                            </>
                          )}
                          {a.status === "Completed" && (
                            <button
                              onClick={() => viewSubmissions(a)}
                              className="px-3 py-1.5 text-xs font-semibold text-primary hover:underline"
                            >
                              View Results
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50">
            <p className="text-sm text-slate-500">
              Showing {filtered.length} of {assignments.length} assignments
            </p>
          </div>
        </div>
      </main>

      {/* ---- create modal ---- */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">New Assignment</h3>
              <button onClick={() => setCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2.5 border rounded-lg bg-slate-50 border-slate-200 outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Introduction to Algebra"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2.5 border rounded-lg bg-slate-50 border-slate-200 outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Mathematics 101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2.5 border rounded-lg bg-slate-50 border-slate-200 outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                >
                  Save as Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- edit modal ---- */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Edit Assignment</h3>
              <button onClick={() => setEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2.5 border rounded-lg bg-slate-50 border-slate-200 outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2.5 border rounded-lg bg-slate-50 border-slate-200 outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2.5 border rounded-lg bg-slate-50 border-slate-200 outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- submissions modal ---- */}
      {subsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4"
          onClick={() => setSubsOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 border border-slate-200 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold">Student Submissions</h3>
                <p className="text-sm text-slate-500 mt-1">{selected?.title}</p>
              </div>
              <button onClick={() => setSubsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {subsLoading ? (
                <div className="py-8 text-center text-slate-400">
                  <span className="material-symbols-outlined animate-spin text-2xl">
                    progress_activity
                  </span>
                  <p className="mt-2 text-sm">Loading submissions...</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl">inbox</span>
                  <p className="mt-2 text-sm">No submissions received yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div
                      key={sub._id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">
                            {sub.studentId?.name || "Unknown Student"}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {sub.studentId?.email || ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">
                            {new Date(sub.submittedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {sub.reviewed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              Reviewed
                            </span>
                          ) : (
                            <button
                              onClick={() => markReviewed(selected._id, sub._id)}
                              className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors"
                            >
                              Mark Reviewed
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-white border border-slate-100 rounded-md">
                        {sub.answer && (
                          <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                            {sub.answer}
                          </p>
                        )}
                        {sub.fileUrl && (
                          <a
                            href={`http://localhost:5001${sub.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-xs font-medium hover:bg-primary/20 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              attach_file
                            </span>
                            {sub.fileName || "Download File"}
                          </a>
                        )}
                        {!sub.answer && !sub.fileUrl && (
                          <p className="text-sm text-slate-400 italic">No content submitted.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 text-right">
              <span className="text-sm text-slate-500">
                {submissions.length} submission{submissions.length !== 1 ? "s" : ""} total
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;
