import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import {
    IconUsers,
    IconCalendar,
    IconBell,
    IconLogout,
    IconLayoutDashboard
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { useNavigate, useLocation } from 'react-router-dom';

interface AssistantLayoutProps {
    children: React.ReactNode;
    onLogout: () => void;
    currentUser: string | null;
}

export function AssistantLayout({ children, onLogout, currentUser }: AssistantLayoutProps) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const isFullPageScreen = ['/history/', '/consult/', '/agenda', '/patients', '/assistant/agenda', '/assistant/patients'].some(path => location.pathname.includes(path));

    const links = [
        {
            label: "Dashboard",
            href: "#",
            icon: (
                <IconLayoutDashboard className="h-5 w-5 shrink-0 text-black stroke-[3]" />
            ),
            onClick: () => navigate('/app/assistant')
        },
        {
            label: "Pacientes Online",
            href: "#",
            icon: (
                <IconUsers className="h-5 w-5 shrink-0 text-black stroke-[3]" />
            ),
            onClick: () => navigate('/app/assistant/patients')
        },
        {
            label: "Agenda",
            href: "#",
            icon: (
                <IconCalendar className="h-5 w-5 shrink-0 text-black stroke-[3]" />
            ),
            onClick: () => navigate('/app/assistant/agenda')
        },
        {
            label: "Notificaciones",
            href: "#",
            icon: (
                <IconBell className="h-5 w-5 shrink-0 text-black stroke-[3]" />
            ),
            onClick: () => navigate('/app/assistant/notifications')
        },
        {
            label: "Cerrar Sesión",
            href: "#",
            icon: (
                <IconLogout className="h-5 w-5 shrink-0 text-black stroke-[3]" />
            ),
            onClick: onLogout
        },
    ];

    return (
        <div
            className={cn(
                "flex flex-col md:flex-row bg-gray-50 w-full flex-1 max-w-full mx-auto border border-gray-200 overflow-hidden",
                "h-screen"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: currentUser || "Asistente",
                                href: "#",
                                icon: (
                                    <div className="h-7 w-7 shrink-0 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                        {currentUser ? currentUser.charAt(0).toUpperCase() : "A"}
                                    </div>
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>
            <div className="flex flex-1">
                <div className={cn(
                    "rounded-tl-2xl border border-gray-200 flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto shadow-inner",
                    isFullPageScreen ? "p-0 bg-transparent border-0" : "p-2 md:p-10 bg-white"
                )}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export const Logo = () => {
    return (
        <a
            href="#"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div className="h-5 w-6 bg-purple-600 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0 shadow-md shadow-purple-500/20" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-gray-800 whitespace-pre text-lg tracking-tight"
            >
                Asistente Pro
            </motion.span>
        </a>
    );
};

export const LogoIcon = () => {
    return (
        <a
            href="#"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div className="h-5 w-6 bg-purple-600 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0 shadow-md shadow-purple-500/20" />
        </a>
    );
};
