import { Button } from "@/components/ui/button";
import Image from "next/image";
import AuthButtons from "./AuthButtons";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const page = async () => {
	const { isAuthenticated } = getKindeServerSession();
	if (await isAuthenticated()) return redirect("/");

	return (
		<div className='w-[100%] h-[100vh]'>
			<div className=" border-2 flex h-1/2 w-1/2 m-auto mt-[15rem] justify-center items-center z-50 shadow-card border-muted-foreground">
			<AuthButtons />
			</div>
		</div>
	);
};
export default page;
