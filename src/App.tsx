import { useState, useEffect } from "react";
import "./App.css";

type Task = { id: string; title: string; due: string; done: boolean; subject: string };

const STORAGE = "homework-tasks";
const SUBJECTS = ["國文", "英文", "數學", "社會", "自然", "其他"];

function daysLeft(due: string): number | null {
  if (!due) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(due); d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [subject, setSubject] = useState("國文");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) setTasks(p);
      } catch { /* ignore */ }
    } else {
      setTasks([
        { id: "demo-1", title: "閱讀心得 1 篇", due: "", done: false, subject: "國文" },
        { id: "demo-2", title: "英文單字 100 個", due: "", done: true, subject: "英文" },
        { id: "demo-3", title: "數學練習本 1-5 章", due: "", done: false, subject: "數學" },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(tasks));
  }, [tasks]);

  function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setTasks((ts) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: title.trim().slice(0, 50),
        due,
        done: false,
        subject,
      },
      ...ts,
    ]);
    setTitle("");
    setDue("");
  }

  function toggleDone(id: string) {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function removeTask(id: string) {
    setTasks((ts) => ts.filter((t) => t.id !== id));
  }

  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.done).length;
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const sorted = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const da = a.due ? daysLeft(a.due) ?? 9999 : 9999;
    const db = b.due ? daysLeft(b.due) ?? 9999 : 9999;
    return da - db;
  });

  return (
    <div className="notebook">
      <header className="nb-bar">
        <a href="https://themakerscamp.com/portfolio" className="nb-back">
          ◀ 回作品集
        </a>
        <span className="nb-date">My Homework Notebook</span>
      </header>

      <main className="nb-main">
        <div className="title-block">
          <h1 className="nb-title">
            寒暑假作業
            <span className="strikeover">不要再拖了!</span>
          </h1>
          <p className="nb-sub">每天打 ✓ 一個 ・ 開學前不會崩潰</p>
        </div>

        <div className="nb-grid">
          {/* Add form (left, like a sticky note) */}
          <aside className="sticky">
            <h2>＋ ADD HOMEWORK</h2>
            <form onSubmit={addTask}>
              <label>作業內容</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
                placeholder="例:讀完哈利波特第 1 集"
                required
              />

              <label>科目</label>
              <div className="subj-row">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubject(s)}
                    className={`subj ${subject === s ? "subj-on" : ""}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <label>截止日(可不填)</label>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />

              <button type="submit" disabled={!title.trim()} className="submit">
                ＋ 加進去
              </button>
            </form>
            <p className="sticky-tip">
              ★ TIP: 開學前才趕 = 開學第一天就累<br />
              一天 ✓ 一兩個比較舒服
            </p>
          </aside>

          {/* Notebook page */}
          <section className="paper">
            <div className="progress-head">
              <div className="prog-line">
                <span>整體進度</span>
                <span className="percent">{percent}%</span>
              </div>
              <div className="prog-bar">
                <div className="prog-fill" style={{ width: `${percent}%` }} />
              </div>
              <div className="prog-meta">
                完成 {doneCount} / 共 {total}
                {total > 0 && <span className="prog-left"> ・ 剩 {total - doneCount} 項</span>}
              </div>
            </div>

            <h2 className="list-title">▼ 作業清單</h2>

            {sorted.length === 0 ? (
              <p className="empty">.. 還沒有作業 ..</p>
            ) : (
              <ul className="todo">
                {sorted.map((t) => {
                  const dl = t.due ? daysLeft(t.due) : null;
                  return (
                    <li key={t.id} className={`todo-item ${t.done ? "todo-done" : ""}`}>
                      <button
                        onClick={() => toggleDone(t.id)}
                        className={`check ${t.done ? "checked" : ""}`}
                      >
                        {t.done && "✓"}
                      </button>
                      <div className="todo-meat">
                        <div className="todo-tags">
                          <span className={`subj-tag subj-${t.subject}`}>{t.subject}</span>
                          {dl !== null && !t.done && (
                            <span className={`due ${dl < 0 ? "due-late" : dl <= 3 ? "due-soon" : ""}`}>
                              {dl < 0 ? `逾期 ${Math.abs(dl)} 天` : dl === 0 ? "今天截止" : `剩 ${dl} 天`}
                            </span>
                          )}
                        </div>
                        <p className="todo-title">{t.title}</p>
                      </div>
                      <button onClick={() => removeTask(t.id)} className="del" aria-label="刪除">
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>

      <footer className="nb-foot">
        <p>★ 這個是 AI 做的 ・ 你的孩子上完 4 週課,也能做出自己的版本 ★</p>
        <a href="https://themakerscamp.com/#register" className="cta">
          AI 造物營 ▶
        </a>
      </footer>
    </div>
  );
}
