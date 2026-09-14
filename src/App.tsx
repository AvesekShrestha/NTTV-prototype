import Layout from "./layout";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Admin from "./pages/Admin/Admin";
import AdminUsers from "./pages/Admin/User";
import Category from "./pages/Admin/Categories";
import Teams from "./pages/Admin/Team";
import TeamDetail from "./pages/Admin/TeamDetail";
import Agent from "./pages/Agent/Agent";
import Staff from "./pages/Staff/Staff";
import Tickets from "./pages/Staff/Tickets";
import CreateTicketPage from "./pages/Staff/NewTicket";
import TicketDetail from "./pages/Staff/TicketDetail";
import Dispatcher from "./pages/Dispatcher/Dispatcher";
import TicketDispatch from "./pages/Dispatcher/TicketDispatch";
import Register from "./pages/Auth/Register";
import Customer from "./pages/Customer/Customer";

const App = () => {
  return (
    <>
      <Routes>
        <Route element={<Layout><Admin /></Layout>} path="/admin" />
        <Route element={<Layout><AdminUsers /></Layout>} path="/users" />
        <Route element={<Layout><Category /></Layout>} path="/category" />
        <Route element={<Layout><Teams /></Layout>} path="/teams" />
        <Route path="/teams/:teamId" element={<TeamDetail />} />

        <Route element={<Layout><Agent /></Layout>} path="/agent" />

        <Route element={<Layout><Staff /></Layout>} path="/staff" />
        <Route element={<Layout><Tickets /></Layout>} path="/tickets" />
        <Route element={<Layout><TicketDetail /></Layout>} path="/tickets/:ticketId" />
        <Route element={<Layout><CreateTicketPage /></Layout>} path="/newTicket" />

        <Route element={<Layout><Dispatcher /></Layout>} path="/dispatcher" />
        <Route element={<Layout><TicketDispatch /></Layout>} path="/ticket/dispatch/:ticketId" />

        <Route element={<Layout><Customer /></Layout>} path="/customer" />

        <Route element={<Login />} path="/login" />
        <Route element={<Register />} path="/register" />
      </Routes>
    </>
  )
}

export default App;
