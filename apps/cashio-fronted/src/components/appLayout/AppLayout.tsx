import React from "react";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* <Sidebar /> */}

      <div style={{ flex: 1 }}>
        {/* <Header /> */}

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
