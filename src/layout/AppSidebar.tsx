"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
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
      { name: "Emergencia", path: "/rppg" },
      { name: "rPPG Local", path: "/rppg-local" },
      { name: "Consultas", path: "/registro/consultas" }

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
  },
  {
    icon: <GridIcon />,
    name: "Historias Clínicas",
    path: "/historias",

  },
  {
    icon: <GridIcon />,
    name: "Diagnósticos",
    path: "/diagnosticos",

  },
  // Asistente eliminado porque no hay ruta /asistente definida aún
  {
    icon: <GridIcon />,
    name: "rPPG",
    path: "/rppg",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { doctor } = useAuth();
  const pathname = usePathname();

  // Dynamic nav items based on role
  const dynamicNavItems = [
    ...navItems,
  ];

  // Add super user option if doctor is super
  if (doctor?.role === "super") {
    dynamicNavItems.splice(3, 0, {
      icon: <GroupIcon />,
      name: "Registrar Doctor",
      path: "/registro-doctor",
    });
  }

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

  const isActive = useCallback(
    (path: string) => {
      if (!pathname) return false;
      if (path === "/") return pathname === "/";
      return pathname === path || pathname.startsWith(path + "/");
    },
    [pathname]
  );

  // Abre automáticamente el submenú cuyo path coincide con la ruta actual
  useEffect(() => {
    for (let i = 0; i < navItems.length; i++) {
      const nav = navItems[i];
      if (
        nav.subItems?.some(
          (si) => pathname === si.path || pathname.startsWith(si.path + "/")
        )
      ) {
        setOpenSubmenu({ type: "main", index: i });
        const key = `main-${i}`;
        const el = subMenuRefs.current[key];
        if (el) {
          setSubMenuHeight((prev) => ({ ...prev, [key]: el.scrollHeight }));
        }
        break;
      }
    }
  }, [pathname]);

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
              {renderMenuItems(dynamicNavItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
