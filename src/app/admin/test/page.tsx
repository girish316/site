"use client";
import { useState } from "react";

export default function FirestoreTestPage() {
  const [log, setLog] = useState<string[]>([]);

  function addLog(msg: string) {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()} — ${msg}`]);
  }

  async function runTest() {
    setLog([]);
    addLog("Starting test...");

    // Step 1: check env vars
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    addLog(`Project ID: ${projectId ?? "MISSING ❌"}`);
    addLog(`API Key: ${apiKey ? apiKey.slice(0, 8) + "..." : "MISSING ❌"}`);

    if (!projectId || !apiKey) {
      addLog("❌ STOP: .env.local is missing Firebase values. Check the file exists and restart dev server.");
      return;
    }

    // Step 2: import firebase
    try {
      addLog("Importing Firebase...");
      const { db } = await import("@/lib/firebase");
      addLog(`✅ Firebase imported. DB: ${db ? "ok" : "null"}`);

      // Step 3: try a write
      addLog("Attempting Firestore write...");
      const { collection, addDoc, deleteDoc, serverTimestamp } = await import("firebase/firestore");
      const ref = await addDoc(collection(db, "_test"), {
        ts: serverTimestamp(),
        msg: "test",
      });
      addLog(`✅ Write succeeded! Doc ID: ${ref.id}`);
      await deleteDoc(ref);
      addLog("✅ Delete succeeded. Firestore is fully working.");

      // Step 4: test blog write
      addLog("Testing blog write...");
      const blogRef = await addDoc(collection(db, "blogs"), {
        title: "Test Post",
        slug: "test-post",
        content: "",
        excerpt: "",
        contentType: "html",
        tags: [],
        status: "draft",
        readingTime: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      addLog(`✅ Blog write succeeded! ID: ${blogRef.id}`);
      await deleteDoc(blogRef);
      addLog("✅ Blog deleted. Everything works — the bug is in the editor UI.");

    } catch (e: any) {
      addLog(`❌ Error code: ${e?.code ?? "none"}`);
      addLog(`❌ Error message: ${e?.message ?? String(e)}`);
      addLog("--- Fix guide ---");
      if (e?.code === "permission-denied") addLog("→ Firestore RULES are blocking writes. Update rules in Firebase Console.");
      if (e?.code === "not-found") addLog("→ Wrong Project ID in .env.local");
      if (e?.code === "unauthenticated") addLog("→ Not signed in, or auth not working.");
      if (!e?.code) addLog("→ Firebase failed to initialize. Check ALL .env.local values are correct.");
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-display font-bold text-2xl text-slate-900 mb-2">Firebase Diagnostic</h1>
      <p className="text-slate-500 text-sm mb-6 font-mono">Tests env vars → Firebase init → Firestore write → blog write</p>

      <button onClick={runTest}
        className="btn-primary mb-6">
        ▶ Run Full Test
      </button>

      {log.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-5 space-y-1.5">
          {log.map((line, i) => (
            <div key={i} className={`font-mono text-sm ${
              line.includes("✅") ? "text-emerald-400" :
              line.includes("❌") ? "text-rose-400" :
              line.includes("→") ? "text-amber-400" :
              "text-slate-300"
            }`}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}
