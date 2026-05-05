import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../navbar";

export default function AppLayout() {
  return (
    <div>
      <Navbar />

      <div className="">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
