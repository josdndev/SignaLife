"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  GridIcon,
  GroupIcon,
  ChatIcon,
  ChevronDownIcon,
  HorizontaLDots,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Registro",
    path: "/registro",
    subItems: [
      { name: "Emergencia", path: "/registro/emergencia" },
      { name: "Consulta", path: "/registro/consultas" },
    ],
  },
  {
    icon: <GroupIcon />,
    name: "Pacientes",
    path: "/pacientes",
    subItems: [
      { name: "Listado", path: "/pacientes/listado" },
      { name: "Habitaciones", path: "/pacientes/habitaciones" },
      { name: "Emergencia", path: "/pacientes/emergencia" },
      { name: "Consultas", path: "/pacientes/consultas" },
    ],
  },
  {
    icon: <GroupIcon />,
    name: "Doctores",
    path: "/doctores",
    subItems: [
      { name: "Listado", path: "/doctores/listado" },
      { name: "Especialidades", path: "/doctores/especialidades" },
    ],
  },
  {
    icon: <GridIcon />,
    name: "Historias Clínicas",
    path: "/historias",
    subItems: [
      { name: "Todas", path: "/historias/todas" },
    ],
  },
  {
    icon: <GridIcon />,
    name: "Diagnósticos",
    path: "/diagnosticos",
    subItems: [
      { name: "Listado", path: "/diagnosticos/listado" },
    ],
  },
  {
    icon: <ChatIcon />,
    name: "Asistente",
    path: "/asistente",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => {
      if (prev?.type === menuType && prev?.index === index) {
        return null;
      }
      return { type: menuType, index };
    });

    const submenuKey = `${menuType}-${index}`;
    const submenuElement = subMenuRefs.current[submenuKey];
    if (submenuElement) {
      setSubMenuHeight((prev) => ({
        ...prev,
        [submenuKey]: submenuElement.scrollHeight,
      }));
    }
  };

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-2">
      {navItems.map((nav, index) => {
        const submenuKey = `${menuType}-${index}`;
        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <>
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`menu-item group ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  } cursor-pointer ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={`menu-item-text`}>{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                        openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                          ? "rotate-180 text-brand-500"
                          : ""
                      }`}
                    />
                  )}
                </button>
                <div
                  ref={(el) => (subMenuRefs.current[submenuKey] = el)}
                  style={{
                    height:
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? subMenuHeight[submenuKey]
                        : 0,
                    overflow: "hidden",
                    transition: "height 0.3s ease",
                  }}
                  className="pl-6"
                >
                  <ul className="flex flex-col gap-2">
                    {nav.subItems.map((subItem, index) => (
                      <li key={`${subItem.name}-${index}`}>
                        <Link
                          href={subItem.path}
                          className={`menu-item group ${
                            isActive(subItem.path)
                              ? "menu-item-active"
                              : "menu-item-inactive"
                          }`}
                        >
                          <span
                            className={`${
                              isActive(subItem.path)
                                ? "menu-item-icon-active"
                                : "menu-item-icon-inactive"
                            }`}
                          >
                            {subItem.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={`menu-item-text`}>{nav.name}</span>
                  )}
                </Link>
              )
            )}
          </li>
        );
      })}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-3 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[220px]"
            : isHovered
            ? "w-[220px]"
            : "w-[70px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-6 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-4">
          <div className="flex flex-col gap-3">
            <div>
              <h2
                className={`mb-3 text-xs uppercase flex leading-[18px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
