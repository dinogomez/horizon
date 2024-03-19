import { getUser } from "@/lib/auth";
import { getFullName } from "@/lib/utils";
import { redirect } from "next/navigation";
import React from "react";

async function Dashboard() {
    const { user } = await getUser();
    if (!user) {
        return redirect("/");
    }
    return (
        <div className="flex w-full justify-center text-2xl">
            dashboard hi, {getFullName(user)}
        </div>
    );
}

export default Dashboard;
