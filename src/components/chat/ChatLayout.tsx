"use client";
import { useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { cn } from "@/lib/utils";
import Sidebar from "../Sidebar";
import MessageContainer from "./MessageContainer";
import { User } from "@/db/dummy";
import { useSelectedUser } from "@/store/useSelectedUser";

interface ChatLayoutProps {
	defaultLayout: number[] | undefined;
	users: User[];
}
const ChatLayout = ({ defaultLayout = [320, 480], users }: ChatLayoutProps) => {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const { selectedUser } = useSelectedUser();

	useEffect(() => {
		const checkScreenWidth = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		// Initial check
		checkScreenWidth();

		// Event listener for screen width changes
		window.addEventListener("resize", checkScreenWidth);

		// Cleanup the event listener on component unmount
		return () => {
			window.removeEventListener("resize", checkScreenWidth);
		};
	}, []);

	return (
		<ResizablePanelGroup
			direction='horizontal'
			className='h-full items-stretch bg-background rounded-lg'
			onLayout={(sizes: number[]) => {
				document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}; `;
			}}
		>
			<ResizablePanel
				defaultSize={defaultLayout[0]}
				collapsedSize={8}
				collapsible={true}
				minSize={isMobile ? 0 : 24}
				maxSize={isMobile ? 8 : 30}
				onCollapse={() => {
					setIsCollapsed(true);
					document.cookie = `react-resizable-panels:collapsed=true;`;
				}}
				onExpand={() => {
					setIsCollapsed(false);
					document.cookie = `react-resizable-panels:collapsed=false;`;
				}}
				className={cn(isCollapsed && "min-w-[80px] transition-all duration-300 ease-in-out")}
			>
				<Sidebar isCollapsed={isCollapsed} users={users} />
			</ResizablePanel>

			<ResizableHandle withHandle />

			<ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
				{!selectedUser && (
					<div className='flex justify-center items-center h-full w-full px-10'>
						<div className='flex flex-col justify-center items-center gap-4'>
							<h3 className='text-4xl font-bold'><span className="shadow text-extra-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">W</span>h<span className="shadow text-extra-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">o</span>o<span className="shadow text-extra-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">s</span><span className="shadow text-extra-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">h</span></h3>
							<p className='text-muted-foreground text-center'>Click on a chat to view the messages</p>
						</div>
					</div>
				)}
				{selectedUser && <MessageContainer />}
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};
export default ChatLayout;
