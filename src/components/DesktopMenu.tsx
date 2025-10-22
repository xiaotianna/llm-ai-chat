'use client'

import React from 'react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@/components/ui/navigation-menu'
import { NavMenusType } from './Navbar'

export default function DesktopMenu({ navMenus }: { navMenus: NavMenusType }) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navMenus.map((item) => (
          <NavigationMenuItem
            key={item.name}
            active={item.active}
            className='font-semibold cursor-pointer'
          >
            {item.children ? (
              <>
                <NavigationMenuTrigger>{item.name}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-0.5 p-1.5 w-[280px]">
                    {item.children.map((child) => {
                      const IconComponent = child.icon
                      return (
                        <NavigationMenuLink
                          key={child.href}
                          href={child.href}
                          className="group relative flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors no-underline"
                        >
                          {IconComponent && (
                            <div className="flex-shrink-0 w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                              <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-none">
                                {child.name}
                              </h3>
                              {child.badge && (
                                <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                  {child.badge}
                                </span>
                              )}
                            </div>
                            {child.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                {child.description}
                              </p>
                            )}
                          </div>
                        </NavigationMenuLink>
                      )
                    })}
                  </div>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink
                href={item.href as string}
                className='text-gray-800 dark:text-gray-400 hover:text-black dark:hover:text-white px-4 py-2'
              >
                {item.name}
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
