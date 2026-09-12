import Layout from "./layout";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Dispatcher from "./pages/Dispatcher/Dispatcher";
import Admin from "./pages/Admin/Admin";
import AdminUsers from "./pages/Admin/User";

const App = () => {
  return (
    <>
      <Routes>
        <Route element={<Layout><Dispatcher /></Layout>} path="/" index />
        <Route element={<Layout><Admin /></Layout>} path="/admin" />
        <Route element={<Layout><AdminUsers /></Layout>} path="/users" />
        <Route element={<Login />} path="/login" />
      </Routes>
    </>
  )
}

export default App;
