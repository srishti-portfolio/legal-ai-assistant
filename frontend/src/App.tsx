import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.js";
import { ProtectedRoute } from "./components/ProtectedRoute.js";
import { AuthProvider } from "./context/AuthContext.js";
import { LanguageProvider } from "./context/LanguageContext.js";
import { Home } from "./routes/Home.js";
import { Login } from "./routes/Login.js";

// Code-split the less frequently hit routes so the initial bundle only pays for the two
// pages nearly every visit needs (sign-in, then Home) — History/You/Register/NotFound load
// on demand instead of up front.
const Register = lazy(() => import("./routes/Register.js").then((m) => ({ default: m.Register })));
const History = lazy(() => import("./routes/History.js").then((m) => ({ default: m.History })));
const You = lazy(() => import("./routes/You.js").then((m) => ({ default: m.You })));
const NotFound = lazy(() => import("./routes/NotFound.js").then((m) => ({ default: m.NotFound })));

function RouteFallback() {
  return <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">Loading…</div>;
}

export function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Home />} />
                <Route path="/history" element={<History />} />
                <Route path="/you" element={<You />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}