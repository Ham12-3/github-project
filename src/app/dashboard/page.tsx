import { auth } from "@clerk/nextjs/server";
import React from "react";

const DashboardPage = async () => {
  const { userId } = await auth();
  return <div>DashboardPage</div>;
};

export default DashboardPage;
