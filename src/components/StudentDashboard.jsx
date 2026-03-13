import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5001/api/assignments";

function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // submit modal
  const [submitModal, setSubmitModal] = useState(null); // holds assignment obj
  const [answerText, setAnswerText] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // view modal
  const [viewModal, setViewModal] = useState(null); // holds submission obj

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchData();
  }, []);

  const headers = { Authorization: `Bearer ${user?.token}` };

  async function fetchData() {
    try {
      const [aRes, sRes] = await Promise.all([
        axios.get(`${API}/published`, { headers }),
        axios.get(`${API}/my-submissions`, { headers }),
      ]);
      setAssignments(aRes.data);
      setSubmissions(sRes.data);
    } catch (err) {
      setError("Failed to load assignments.");
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  function getSubmission(assignmentId) {
    return submissions.find((s) => s.assignmentId === assignmentId);
  }

  function isPastDue(dueDate) {
    return new Date() > new Date(dueDate);
  }

  function openSubmitModal(assignment) {
    setSubmitModal(assignment);
    setAnswerText("");
    setFile(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!answerText.trim() && !file) {
      alert("Please write an answer or upload a file.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("assignmentId", submitModal._id);
      fd.append("answer", answerText);
      if (file) fd.append("file", file);

      await axios.post(`${API}/submit`, fd, { headers });
      setSubmitModal(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const userName = user?.name || "Student";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
      {/* sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-primary text-white">
            <span className="material-symbols-outlined">auto_stories</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Assignment Portal</h2>
        </div>
        <nav className="flex-1 px-4 pt-4 space-y-1 overflow-y-auto">
          <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium">
            <span className="material-symbols-outlined text-[22px]">dashboard</span>
            Dashboard
          </span>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-8 h-16 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <h1 className="text-sm font-medium tracking-wider uppercase text-slate-500">
            Student Overview
          </h1>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-none">{userName}</p>
              <p className="mt-1 text-xs text-slate-500">Student</p>
            </div>
            <div className="flex items-center justify-center font-bold text-slate-600 bg-slate-200 border rounded-full w-9 h-9 border-slate-200">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-10">
            <section>
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back, {userName.split(" ")[0]}
              </h2>
              <p className="max-w-2xl mt-2 text-slate-600">
                Here are your active assignments. Submit your work before the due date.
              </p>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Active Assignments</h3>
                <span className="text-sm text-slate-400">
                  {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined animate-spin text-3xl">
                      progress_activity
                    </span>
                    <p className="mt-2">Loading assignments...</p>
                  </div>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : assignments.length === 0 ? (
                  <div className="py-12 text-center border rounded-xl bg-white border-slate-200">
                    <span className="material-symbols-outlined text-4xl text-slate-300">
                      inbox
                    </span>
                    <p className="mt-2 text-slate-500">No assignments available yet.</p>
                  </div>
                ) : (
                  assignments.map((a) => {
                    const sub = getSubmission(a._id);
                    const pastDue = isPastDue(a.dueDate);

                    return (
                      <div
                        key={a._id}
                        className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-primary/40 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                              sub
                                ? "bg-green-100 text-green-600"
                                : "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                            }`}
                          >
                            <span className="material-symbols-outlined">
                              {sub ? "check_circle" : "assignment"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{a.title}</p>
                            <p className="text-sm text-slate-500">{a.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-right">
                          <div className="hidden sm:block">
                            <p className="mb-1 text-xs font-medium tracking-wider uppercase text-slate-400">
                              Due Date
                            </p>
                            <p
                              className={`text-sm font-medium ${
                                pastDue ? "text-red-500" : "text-slate-700"
                              }`}
                            >
                              {new Date(a.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>

                          {sub ? (
                            <button
                              onClick={() => setViewModal(sub)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                check
                              </span>
                              Submitted
                            </button>
                          ) : pastDue ? (
                            <span className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg">
                              Past Due
                            </span>
                          ) : (
                            <button
                              onClick={() => openSubmitModal(a)}
                              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                            >
                              Submit
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ---- submit modal ---- */}
      {submitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4"
          onClick={() => setSubmitModal(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold">Submit Assignment</h3>
                <p className="text-sm text-slate-500 mt-1">{submitModal.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Due:{" "}
                  {new Date(submitModal.dueDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => setSubmitModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Your Answer
                </label>
                <textarea
                  className="w-full px-3 py-3 border rounded-lg bg-slate-50 border-slate-200 outline-none focus:ring-2 focus:ring-primary text-sm min-h-[120px] resize-y"
                  placeholder="Write your answer here..."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Upload File (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                    onChange={(e) => setFile(e.target.files[0] || null)}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined">cloud_upload</span>
                    </div>
                    <div>
                      {file ? (
                        <>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-slate-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-slate-600">
                            Click to upload a file
                          </p>
                          <p className="text-xs text-slate-400">
                            Images, PDF, Word, Text, ZIP (Max 50 MB)
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                  {file && (
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">
                  warning
                </span>
                <p className="text-xs text-amber-700">
                  Once submitted, you <strong>cannot edit or resubmit</strong> this
                  assignment. Please review your work carefully.
                </p>
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setSubmitModal(null)}
                  className="px-4 py-2 font-medium text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-medium text-sm text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">
                        progress_activity
                      </span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      Submit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- view submission modal ---- */}
      {viewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4"
          onClick={() => setViewModal(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Your Submission</h3>
              <button
                onClick={() => setViewModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Submitted on{" "}
                {new Date(viewModal.submittedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>

              {viewModal.answer && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1.5">Answer</p>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {viewModal.answer}
                    </p>
                  </div>
                </div>
              )}

              {viewModal.fileUrl && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1.5">Attached File</p>
                  <a
                    href={`http://localhost:5001${viewModal.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-primary">attach_file</span>
                    <span className="text-sm text-primary font-medium">
                      {viewModal.fileName || "Download File"}
                    </span>
                  </a>
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-slate-100 rounded-lg mt-4">
                <span className="material-symbols-outlined text-slate-400 text-[18px] mt-0.5">
                  lock
                </span>
                <p className="text-xs text-slate-500">
                  This submission is locked and cannot be edited.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
