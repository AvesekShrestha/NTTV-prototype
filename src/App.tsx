import Layout from "./layout";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Admin from "./pages/Admin/Admin";
import AdminUsers from "./pages/Admin/User";
import Category from "./pages/Admin/Categories";
import Teams from "./pages/Admin/Team";
import TeamDetail from "./pages/Admin/TeamDetail";

const App = () => {
  return (
    <>
      <Routes>
        <Route element={<Layout><Admin /></Layout>} path="/admin" />
        <Route element={<Layout><AdminUsers /></Layout>} path="/users" />
        <Route element={<Layout><Category /></Layout>} path="/category" />
        <Route element={<Layout><Teams /></Layout>} path="/teams" />
        <Route path="/teams/:teamId" element={<TeamDetail />} />
        <Route element={<Login />} path="/login" />
      </Routes>
    </>
  )
}

export default App;
