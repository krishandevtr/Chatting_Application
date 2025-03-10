"use client";
import { Button } from "@/components/ui/button";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useState } from "react";

const AuthButtons = () => {
	const [isLoading, setIsLoading] = useState(false);

	return (
		<div className='flex space-x-5 w-full items-center justify-center '>
			<RegisterLink className='flex' onClick={() => setIsLoading(true)}>
				<Button className='w-full' variant={"outline"} disabled={isLoading}>
					Sign up
				</Button>
			</RegisterLink>
			<LoginLink className='flex' onClick={() => setIsLoading(true)}>
				<Button className='w-full' disabled={isLoading}>
					Login
				</Button>
			</LoginLink>
		</div>
	);
};
export default AuthButtons;
